// BACKEND/services/pubmedRagService.js
//
/*
WHAT:
  Searches PubMed and uses retrieved PubMed abstracts to answer a question.

WHY:
  The language model should answer from real medical research rather than
  depending only on its internal training knowledge.

HOW:
  1. Search PubMed with NCBI ESearch.
  2. Retrieve matching records with NCBI EFetch.
  3. Parse the returned PubMed XML.
  4. Give the retrieved abstracts to OpenAI.
  5. Return the answer and PubMed citations.

IMPORTANT:
  - This file does not use or change MongoDB.
  - This file does not change authentication or Socket.IO.
  - PubMed usually supplies citations and abstracts, not complete articles.
  - This is a research test and not a clinical diagnosis system.
*/

import { XMLParser } from "fast-xml-parser";
import OpenAI from "openai";

const NCBI_API_BASE_URL =
  "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

const DEFAULT_MAXIMUM_RESULTS = 8;
const MAXIMUM_ALLOWED_RESULTS = 20;
const MAXIMUM_ABSTRACT_CHARACTERS = 4000;
const MAXIMUM_HISTORY_MESSAGES = 8;
const PUBMED_REQUEST_TIMEOUT_MILLISECONDS = 20000;

const pubMedXmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  trimValues: true,
  parseTagValue: false,
  isArray: (tagName) =>
    [
      "PubmedArticle",
      "AbstractText",
      "Author",
      "PublicationType",
      "ArticleId",
    ].includes(tagName),
});

function createRequestError(message, statusCode = 500) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function cleanText(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).replace(/\s+/g, " ").trim();
}

function limitTextLength(value, maximumCharacters) {
  const cleanedValue = cleanText(value);

  if (cleanedValue.length <= maximumCharacters) {
    return cleanedValue;
  }

  return `${cleanedValue.slice(0, maximumCharacters).trim()}…`;
}

function ensureArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value === null || value === undefined) {
    return [];
  }

  return [value];
}

function getPubMedArticleUrl(pubmedId) {
  return `https://pubmed.ncbi.nlm.nih.gov/${pubmedId}/`;
}

function getNcbiRequestParameters(additionalParameters = {}) {
  const requestParameters = new URLSearchParams({
    db: "pubmed",
    tool: process.env.NCBI_TOOL || "chat_app_expo",
    email: process.env.NCBI_EMAIL || "",
  });

  for (const [parameterName, parameterValue] of Object.entries(
    additionalParameters
  )) {
    if (
      parameterValue !== undefined &&
      parameterValue !== null &&
      String(parameterValue).trim()
    ) {
      requestParameters.set(parameterName, String(parameterValue));
    }
  }

  const ncbiApiKey = cleanText(process.env.NCBI_API_KEY);
  const isPlaceholderKey =
    !ncbiApiKey ||
    ncbiApiKey === "..." ||
    ncbiApiKey.toLowerCase().includes("optional") ||
    ncbiApiKey.startsWith("your_");

  if (!isPlaceholderKey) {
    requestParameters.set("api_key", ncbiApiKey);
  }

  return requestParameters;
}

async function fetchFromNcbi(url, responseType) {
  const abortController = new AbortController();

  const timeout = setTimeout(() => {
    abortController.abort();
  }, PUBMED_REQUEST_TIMEOUT_MILLISECONDS);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept:
          responseType === "json"
            ? "application/json"
            : "application/xml, text/xml",
      },
      signal: abortController.signal,
    });

    if (!response.ok) {
      throw createRequestError(
        `NCBI request failed with status ${response.status}.`,
        502
      );
    }

    if (responseType === "json") {
      return await response.json();
    }

    return await response.text();
  } catch (error) {
    if (error.name === "AbortError") {
      throw createRequestError(
        "The PubMed request took too long and was cancelled.",
        504
      );
    }

    if (error.statusCode) {
      throw error;
    }

    throw createRequestError(
      `Unable to connect to PubMed: ${error.message}`,
      502
    );
  } finally {
    clearTimeout(timeout);
  }
}

function getArticleTitle(articleTitleValue) {
  if (typeof articleTitleValue === "string") {
    return cleanText(articleTitleValue);
  }

  if (
    articleTitleValue &&
    typeof articleTitleValue === "object" &&
    articleTitleValue["#text"]
  ) {
    return cleanText(articleTitleValue["#text"]);
  }

  return cleanText(articleTitleValue);
}

function getAbstractSectionText(abstractSection) {
  if (typeof abstractSection === "string") {
    return cleanText(abstractSection);
  }

  if (!abstractSection || typeof abstractSection !== "object") {
    return "";
  }

  const sectionText = cleanText(abstractSection["#text"]);
  const sectionLabel = cleanText(
    abstractSection["@_Label"] || abstractSection["@_NlmCategory"]
  );

  if (!sectionText) {
    return "";
  }

  if (!sectionLabel) {
    return sectionText;
  }

  return `${sectionLabel}: ${sectionText}`;
}

function getCompleteAbstract(article) {
  const abstractSections = ensureArray(
    article?.MedlineCitation?.Article?.Abstract?.AbstractText
  );

  return abstractSections
    .map(getAbstractSectionText)
    .filter(Boolean)
    .join("\n");
}

function getAuthorName(author) {
  if (!author || typeof author !== "object") {
    return "";
  }

  const collectiveName = cleanText(author.CollectiveName);

  if (collectiveName) {
    return collectiveName;
  }

  const firstName = cleanText(author.ForeName || author.Initials);
  const lastName = cleanText(author.LastName);

  return [firstName, lastName].filter(Boolean).join(" ");
}

function getAuthors(article) {
  return ensureArray(
    article?.MedlineCitation?.Article?.AuthorList?.Author
  )
    .map(getAuthorName)
    .filter(Boolean);
}

function getPublicationTypes(article) {
  return ensureArray(
    article?.MedlineCitation?.Article?.PublicationTypeList?.PublicationType
  )
    .map((publicationType) => {
      if (typeof publicationType === "string") {
        return cleanText(publicationType);
      }

      return cleanText(publicationType?.["#text"]);
    })
    .filter(Boolean);
}

function getPublicationYear(article) {
  const journalIssue =
    article?.MedlineCitation?.Article?.Journal?.JournalIssue;

  const publicationDate = journalIssue?.PubDate;

  const directYear = cleanText(publicationDate?.Year);

  if (directYear) {
    return directYear;
  }

  const medlineDate = cleanText(publicationDate?.MedlineDate);
  const fourDigitYear = medlineDate.match(/\b(18|19|20)\d{2}\b/);

  if (fourDigitYear) {
    return fourDigitYear[0];
  }

  const articleDate = ensureArray(
    article?.MedlineCitation?.Article?.ArticleDate
  )[0];

  return cleanText(articleDate?.Year);
}

function getArticleIdentifier(article, identifierType) {
  const articleIdentifiers = ensureArray(
    article?.PubmedData?.ArticleIdList?.ArticleId
  );

  const matchingIdentifier = articleIdentifiers.find((identifier) => {
    return (
      cleanText(identifier?.["@_IdType"]).toLowerCase() ===
      identifierType.toLowerCase()
    );
  });

  if (typeof matchingIdentifier === "string") {
    return cleanText(matchingIdentifier);
  }

  return cleanText(matchingIdentifier?.["#text"]);
}

function convertPubMedXmlArticle(article) {
  const pubmedId = cleanText(
    article?.MedlineCitation?.PMID?.["#text"] ||
      article?.MedlineCitation?.PMID
  );

  const title = getArticleTitle(
    article?.MedlineCitation?.Article?.ArticleTitle
  );

  if (!pubmedId || !title) {
    return null;
  }

  const completeAbstract = getCompleteAbstract(article);

  return {
    pubmedId,
    title,
    abstract: limitTextLength(
      completeAbstract,
      MAXIMUM_ABSTRACT_CHARACTERS
    ),
    authors: getAuthors(article),
    journal:
      cleanText(article?.MedlineCitation?.Article?.Journal?.Title) ||
      "Unknown journal",
    publicationYear: getPublicationYear(article),
    publicationTypes: getPublicationTypes(article),
    doi: getArticleIdentifier(article, "doi"),
    pubmedCentralId: getArticleIdentifier(article, "pmc"),
    url: getPubMedArticleUrl(pubmedId),
  };
}

export async function searchPubMed(
  searchQuery,
  maximumResults = DEFAULT_MAXIMUM_RESULTS
) {
  const cleanedSearchQuery = cleanText(searchQuery);

  if (!cleanedSearchQuery) {
    return [];
  }

  const safeMaximumResults = Math.min(
    Math.max(Number(maximumResults) || DEFAULT_MAXIMUM_RESULTS, 1),
    MAXIMUM_ALLOWED_RESULTS
  );

  const requestParameters = getNcbiRequestParameters({
    term: cleanedSearchQuery,
    retmode: "json",
    retmax: safeMaximumResults,
    sort: "relevance",
  });

  const searchUrl =
    `${NCBI_API_BASE_URL}/esearch.fcgi?` +
    requestParameters.toString();

  const searchResult = await fetchFromNcbi(searchUrl, "json");

  const pubmedIds = searchResult?.esearchresult?.idlist;

  if (!Array.isArray(pubmedIds)) {
    return [];
  }

  return pubmedIds.map(cleanText).filter(Boolean);
}

export async function fetchPubMedArticles(pubmedIds) {
  const cleanedPubmedIds = ensureArray(pubmedIds)
    .map(cleanText)
    .filter(Boolean);

  if (cleanedPubmedIds.length === 0) {
    return [];
  }

  const requestParameters = getNcbiRequestParameters({
    id: cleanedPubmedIds.join(","),
    rettype: "abstract",
    retmode: "xml",
  });

  const fetchUrl =
    `${NCBI_API_BASE_URL}/efetch.fcgi?` +
    requestParameters.toString();

  const pubmedXml = await fetchFromNcbi(fetchUrl, "xml");

  let parsedPubmedResponse;

  try {
    parsedPubmedResponse = pubMedXmlParser.parse(pubmedXml);
  } catch (error) {
    throw createRequestError(
      `PubMed returned XML that could not be parsed: ${error.message}`,
      502
    );
  }

  const pubmedArticles = ensureArray(
    parsedPubmedResponse?.PubmedArticleSet?.PubmedArticle
  );

  return pubmedArticles
    .map(convertPubMedXmlArticle)
    .filter(Boolean);
}

function createEvidenceContext(sources) {
  return sources
    .map((source, sourceIndex) => {
      return [
        `SOURCE ${sourceIndex + 1}`,
        `PMID: ${source.pubmedId}`,
        `Title: ${source.title}`,
        `Journal: ${source.journal}`,
        `Year: ${source.publicationYear || "Unknown"}`,
        `Publication types: ${
          source.publicationTypes.join(", ") || "Unknown"
        }`,
        `Abstract: ${
          source.abstract || "No abstract was provided by PubMed."
        }`,
      ].join("\n");
    })
    .join("\n\n");
}

function normalizeConversationHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter((historyMessage) => {
      return (
        historyMessage &&
        ["user", "assistant"].includes(historyMessage.role) &&
        typeof historyMessage.content === "string" &&
        historyMessage.content.trim()
      );
    })
    .slice(-MAXIMUM_HISTORY_MESSAGES)
    .map((historyMessage) => ({
      role: historyMessage.role,
      content: limitTextLength(historyMessage.content, 1000),
    }));
}

export async function answerQuestionFromPubMed({
  question,
  sources,
  history = [],
}) {
  const openAiApiKey = cleanText(process.env.OPENAI_API_KEY);

  if (!openAiApiKey) {
    throw createRequestError(
      "OPENAI_API_KEY is missing on the server.",
      500
    );
  }

  const openAiModel =
    cleanText(process.env.OPENAI_MODEL) || "gpt-4o-mini";

  if (sources.length === 0) {
    return {
      answer:
        "I could not find useful PubMed abstracts for this question. Try including a specific condition, symptom, treatment or medication name.",
      model: openAiModel,
    };
  }

  const openAiClient = new OpenAI({
    apiKey: openAiApiKey,
  });

  const systemInstructions = [
    "You are a medical research guidance assistant.",
    "Use only the PubMed evidence included in the current request.",
    "Do not use unsupported facts from memory.",
    "Do not diagnose the user.",
    "Do not prescribe medication or tell the user to change a prescription.",
    "Clearly explain when the evidence is limited or conflicting.",
    "Cite every medical claim using the supplied PMID.",
    "Use citation format [PMID:12345678].",
    "Never invent a PMID, article, statistic or conclusion.",
    "Finish with a brief reminder that the response is educational and does not replace a qualified clinician.",
  ].join(" ");

  const currentQuestionWithEvidence = [
    "USER QUESTION",
    question,
    "",
    "PUBMED EVIDENCE",
    createEvidenceContext(sources),
  ].join("\n");

  const completion = await openAiClient.chat.completions.create({
    model: openAiModel,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: systemInstructions,
      },
      ...normalizeConversationHistory(history),
      {
        role: "user",
        content: currentQuestionWithEvidence,
      },
    ],
  });

  const answer = cleanText(
    completion.choices?.[0]?.message?.content
  );

  if (!answer) {
    throw createRequestError(
      "OpenAI returned an empty response.",
      502
    );
  }

  return {
    answer,
    model: openAiModel,
  };
}

export async function runPubMedRagChat({
  message,
  history = [],
  maximumResults = DEFAULT_MAXIMUM_RESULTS,
}) {
  const question = cleanText(message);

  if (!question) {
    throw createRequestError("Message is required.", 400);
  }

  const pubmedIds = await searchPubMed(
    question,
    maximumResults
  );

  const sources = await fetchPubMedArticles(pubmedIds);

  const answerResult = await answerQuestionFromPubMed({
    question,
    sources,
    history,
  });

  return {
    answer: answerResult.answer,
    model: answerResult.model,
    retrievedCount: sources.length,
    sources: sources.map((source) => ({
      pubmedId: source.pubmedId,
      title: source.title,
      authors: source.authors,
      journal: source.journal,
      publicationYear: source.publicationYear,
      publicationTypes: source.publicationTypes,
      doi: source.doi,
      pubmedCentralId: source.pubmedCentralId,
      url: source.url,
    })),
  };
}
