/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(auth)/login` | `/(auth)/signup` | `/(tabs)` | `/(tabs)/` | `/(tabs)/profile` | `/(tabs)/receipts` | `/_sitemap` | `/login` | `/profile` | `/receipt/add` | `/receipts` | `/signup`;
      DynamicRoutes: `/receipt/${Router.SingleRoutePart<T>}`;
      DynamicRouteTemplate: `/receipt/[id]`;
    }
  }
}
