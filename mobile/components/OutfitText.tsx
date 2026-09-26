import { forwardRef } from 'react';
import { StyleSheet, Text as NativeText, TextInput as NativeTextInput } from 'react-native';
import type { StyleProp, TextInputProps, TextProps, TextStyle } from 'react-native';

const fontByWeight: Record<string, string> = {
  normal: 'Outfit_400Regular',
  bold: 'Outfit_700Bold',
  '400': 'Outfit_400Regular',
  '500': 'Outfit_500Medium',
  '600': 'Outfit_600SemiBold',
  '700': 'Outfit_700Bold',
  '800': 'Outfit_800ExtraBold',
  '900': 'Outfit_900Black',
};

function withOutfit(style: StyleProp<TextStyle>) {
  const weight = String(StyleSheet.flatten(style)?.fontWeight ?? '400');
  return [{ fontFamily: fontByWeight[weight] ?? 'Outfit_400Regular' }, style];
}

export const Text = forwardRef<React.ElementRef<typeof NativeText>, TextProps>(
  function OutfitText({ style, ...props }, ref) {
    return <NativeText ref={ref} {...props} style={withOutfit(style)} />;
  }
);

export const TextInput = forwardRef<React.ElementRef<typeof NativeTextInput>, TextInputProps>(
  function OutfitTextInput({ style, ...props }, ref) {
    return <NativeTextInput ref={ref} {...props} style={withOutfit(style)} />;
  }
);