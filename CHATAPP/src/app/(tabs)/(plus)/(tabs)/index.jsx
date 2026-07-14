import { Redirect } from "expo-router";

export default function PlusTabsIndexRedirect() {
	return <Redirect href="/(tabs)/(plus)/(tabs)/(home)/home" />;
}
