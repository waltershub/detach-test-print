import React from 'react';
import { Button, Image, View, Text } from 'react-native';
import { ImagePicker, Permissions } from 'expo';
import RNPrint from 'react-native-print';
import RNHTMLtoPDF from 'react-native-html-to-pdf';

export default class ImagePickerExample extends React.Component {
  state = {
    image: null,
    status: null,
    selectPrinter: null,
    base64: null,
  };

  componentDidMount() {
    this._getPermissions();
  }

  _getPermissions = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    if (status === 'granted') this.setState({ status: true });
  };

  selectPrinter = async () => {
    const selectedPrinter = await RNPrint.selectPrinter();
    this.setState({ selectedPrinter });
  };

  _pickImage = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      base64: true,
    });

    //console.log(result);

    if (!result.cancelled) {
      this.setState({ image: result.uri, base64: result.base64 });
    }
  };

  async printHTML(image) {
    await RNPrint.print({
      html: `<h2>Visitor</h2><h3>NAME: Walter Shub</h3><img src="data:image/png;base64,${image}" width="50" height="50" />`,
    });
  }

  async printPDF(image) {
    const results = await RNHTMLtoPDF.convert({
      html: `<center><h1 style="width:20px;height:20px;">Visitor</h1><h1>NAME: Walter Shub</h1><img src="data:image/png;base64,${image}" width="600" height="600" /></center>`,
      fileName: 'test',
      base64: true,
    });

    await RNPrint.print({ filePath: results.filePath });
  }

  render() {
    let { base64 } = this.state;
    let { image } = this.state;
    let { selectedPrinter } = this.state;
    console.log(selectedPrinter);
    if (!this.state.status) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>please enable CAMERA </Text>
        </View>
      );
    } else {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          {selectedPrinter && (
            <View>
              <Text>{`Selected Printer Name: ${this.state.selectedPrinter.name}`}</Text>
              <Text>{`Selected Printer URI: ${this.state.selectedPrinter.url}`}</Text>
            </View>
          )}
          <Button title="Select Printer" onPress={this.selectPrinter} />
          <Button title="Pick an image from camera roll" onPress={this._pickImage} />
          {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
          <Button title="print pdf" onPress={() => this.printPDF(base64)} />
          <Button title="print html" onPress={() => this.printHTML(base64)} />
        </View>
      );
    }
  }
}
