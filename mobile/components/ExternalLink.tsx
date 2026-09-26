import { Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import type { ComponentProps } from 'react';
import { Platform } from 'react-native';

export function ExternalLink(props: Omit<ComponentProps<typeof Link>, 'href'> & { href: string | URL }) {
  const href = typeof props.href === 'string' ? props.href : props.href.toString();
  const hrefValue = href as ComponentProps<typeof Link>['href'];

  return (
    <Link
      target="_blank"
      {...props}
      href={hrefValue}
      onPress={(e) => {
        if (Platform.OS !== 'web') {
          // Prevent the default behavior of linking to the default browser on native.
          e.preventDefault();
          // Open the link in an in-app browser.
          WebBrowser.openBrowserAsync(href);
        }
      }}
    />
  );
}
