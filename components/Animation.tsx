import LottieView from "lottie-react-native";
import React from "react";

type AnimationProps = LottieView["props"] & {};

export const Animation = ({ source, style }: AnimationProps) => {
    return <LottieView autoPlay style={style} source={source} />;
};
