import React from 'react';
import { Button, Image, View, Text } from 'react-native';
import { ImagePicker, Permissions } from 'expo';

export default class ImagePickerExample extends React.Component {
  state = {
    image: null,
    status: null,
  };

  componentDidMount() {
    console.log(Permissions);
    this._getPermissions();
  }

  _getPermissions = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    if (status === 'granted') this.setState({ status: true });
  };

  _pickImage = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
    });

    console.log(result);

    if (!result.cancelled) {
      this.setState({ image: result.uri });
    }
  };

  render() {
    let { image } = this.state;
    if (!this.state.status) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>please enable CAMERA </Text>
        </View>
      );
    } else {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Button title="Pick an image from camera roll" onPress={this._pickImage} />
          {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
        </View>
      );
    }
  }
}
