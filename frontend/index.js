import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';

let App;
try {
  App = require('./App').default;
} catch (err) {
  loadError = err;
  console.error('Error loading App:', err);
  const { View, Text } = require('react-native');
  const msg = String(err?.message ?? err);
  App = function ErrorApp() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
        <Text style={{ color: 'red', fontSize: 14 }}>Error al cargar la app:</Text>
        <Text style={{ marginTop: 10 }}>{msg}</Text>
      </View>
    );
  };
}

AppRegistry.registerComponent(appName, () => App);




