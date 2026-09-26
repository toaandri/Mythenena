import React from 'react';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

type MythenenaLogoProps = {
  size?: number;
};

export default function MythenenaLogo({ size = 25 }: MythenenaLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none" accessibilityLabel="Logo Mythenena">
      <Defs>
        <LinearGradient id="mythenena-mark" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <Stop stopColor="#5FB3A4" />
          <Stop offset="1" stopColor="#357A6F" />
        </LinearGradient>
      </Defs>
      <Rect width="40" height="40" rx="11" fill="url(#mythenena-mark)" />
      <Path d="M20 30.5C20 30.5 8.4 22.6 8.4 15.2C8.4 11.6 11.2 8.8 14.6 8.8C16.9 8.8 18.9 10 19.8 11.6C20.8 10 22.7 8.8 25 8.8C28.4 8.8 31.2 11.6 31.2 15.2C31.2 22.6 20 30.5 20 30.5Z" fill="white" fillOpacity="0.96" />
      <Path d="M20 18.4C18.7 16.9 17.4 17.4 17.4 19.1C17.4 20.8 20 23.2 20 23.2C20 23.2 22.6 20.8 22.6 19.1C22.6 17.4 21.3 16.9 20 18.4Z" fill="#4A9B8E" fillOpacity="0.35" />
      <Rect x="21.5" y="4.5" width="13.5" height="9.5" rx="4.2" fill="white" fillOpacity="0.96" />
      <Path d="M25.2 13.4L22.6 16.6L28.4 13.4Z" fill="white" fillOpacity="0.96" />
      <Circle cx="25.4" cy="9.2" r="1.25" fill="#4A9B8E" />
      <Circle cx="28.3" cy="9.2" r="1.25" fill="#4A9B8E" />
      <Circle cx="31.2" cy="9.2" r="1.25" fill="#4A9B8E" />
    </Svg>
  );
}
