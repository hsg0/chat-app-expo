import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function InnerNavBar({
	brand = "forever",
	cartCount = 0,
	onPressMenu,
	onPressCart,
	showMenu = true,
	showCart = true,
}) {
	const safeCartCount = Number.isFinite(cartCount) ? Math.max(0, cartCount) : 0;
	const showBadge = safeCartCount > 0;
	const badgeText = safeCartCount > 99 ? "99+" : String(safeCartCount);

	return (
		<View className="flex-row items-center justify-between px-3 py-2 bg-white border-b border-gray-200">
			{/* left side */}
			<View className="w-9 h-9 items-center justify-center">
				{showMenu && (
					<TouchableOpacity onPress={onPressMenu} activeOpacity={0.7}>
						<Ionicons name="menu-outline" size={22} color="#111827" />
					</TouchableOpacity>
				)}
			</View>

			{/* center */}
			<View className="flex-row items-center gap-1">
				<Ionicons name="cart-outline" size={18} color="#111827" />
				<Text className="text-[35px] font-extrabold text-gray-900 -mt-0.5">{brand}</Text>
			</View>

			{/* right side */}
			<View className="w-9 h-9 items-center justify-center">
				{showCart && (
					<TouchableOpacity onPress={onPressCart} activeOpacity={0.7}>
						<View className="relative">
							<Ionicons name="bag-outline" size={22} color="#111827" />
							{showBadge && (
								<View className="absolute -top-1 -right-1 bg-red-500 w-4 h-4 rounded-full items-center justify-center">
									<Text className="text-white text-[10px] font-bold">{badgeText}</Text>
								</View>
							)}
						</View>
					</TouchableOpacity>
				)}
			</View>
		</View>
	);
}
