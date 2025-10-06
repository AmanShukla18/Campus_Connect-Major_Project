import React from 'react';
import { Image, View, StyleSheet } from 'react-native';

export default function Avatar({ uri, size = 48 }: { uri?: string; size?: number }) {
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
      {/* Use placeholder remote image if local assets aren't available */}
      <Image source={ uri ? { uri } : { uri: 'https://via.placeholder.com/150' } } style={{ width: size, height: size, borderRadius: size / 2 }} />
    </View>
  );
}

const styles = StyleSheet.create({ container: { overflow: 'hidden' } });
