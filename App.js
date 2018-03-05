import React from 'react';
import { Button, Image, View, Text, CameraRoll } from 'react-native';
import { ImagePicker, Permissions } from 'expo';
import RNPrint from 'react-native-print';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import PDFLib, { PDFDocument, PDFPage } from 'react-native-pdf-lib';
import uniqueId from 'lodash.uniqueid';
import moment from 'moment';
export default class ImagePickerExample extends React.Component {
  state = {
    image: null,
    status: null,
    selectPrinter: null,
    base64: null,
    exif: null,
  };

  componentDidMount() {
    this._getPermissions();
  }

  _getPermissions = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (status === 'granted') this.setState({ status: true });
  };

  selectPrinter = async () => {
    const selectedPrinter = await RNPrint.selectPrinter();
    this.setState({ selectedPrinter });
  };

  printPdfLib = async jpgPath => {
    const page2 = PDFPage.create()
      .setMediaBox(200, 200)
      .drawText('You can add text and rectangles to the PDF!', {
        x: 5,
        y: 235,
        color: '#007386',
      })
      .drawRectangle({
        x: 25,
        y: 25,
        width: 150,
        height: 150,
        color: '#FF99CC',
      })
      .drawRectangle({
        x: 75,
        y: 75,
        width: 50,
        height: 50,
        color: '#99FFCC',
      });

    const page1 = PDFPage.create()
      .setMediaBox(250, 250)
      .drawText('You can add JPG images too!')
      .drawImage(jpgPath, 'jpg', {
        x: 5,
        y: 125,
        width: 200,
        height: 100,
      });

    const docsDir = await PDFLib.getDocumentsDirectory();
    const pdfPath = `${docsDir}/sample.pdf`;
    PDFDocument.create(pdfPath)
      .addPages(page1)
      .write() // Returns a promise that resolves with the PDF's path
      .then(path => {
        console.log('PDF created at: ' + path);
        RNPrint.print({ filePath: path });
        // Do stuff with your shiny new PDF!
      });
  };

  _pickImage = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      base64: true,
      exif: true,
    });

    //console.log(result);

    if (!result.cancelled) {
      this.setState({ image: result.uri, base64: result.base64, exif: result.exif });
    }
  };

  async printHTML(image) {
    await RNPrint.print({
      html: `<h2>Visitor</h2><h3>NAME: Walter Shub</h3><img src="data:image/png;base64,${image}" width="50" height="50" />`,
    });
  }

  async printPDF(image) {
    const results = await RNHTMLtoPDF.convert({
      html: `<div style="display: flex;flex-direction: column;align-items: center;">
              <div style="display: flex;flex-direction: row;align-items: center;" >
              <img src="http://www.repticity.com/beta/images/logos/8816phoenix.png" alt="Smiley face" width="150" height="250">
              <h3 style="font-size: 30px;" >Rehabilitation and Health Care Center</h3>
              </div>
              <h1 style="font-size: 30px;border-bottom: 5px solid black;border-top: 5px solid black; padding:0 500px;padding-bottom:20px; padding-Top:20px">Visitor</h1>
              <h2 style="font-size: 30px;">Name: Walter Shub</h2>
              <h2 style="font-size: 30px;">${moment().format(' MMMM Do YYYY')}</h2>
              <h2 style="font-size: 30px;">Visit ID: ${uniqueId(
                Math.floor(Math.random() * 100 + 1)
              )}</h2>
              <img src="data:image/png;base64,${image}" width="400" height="400" />
            </div>`,
      fileName: 'test',
      base64: true,
    });

    await RNPrint.print({ filePath: results.filePath });
  }

  render() {
    let { base64 } = this.state;
    let { image } = this.state;
    let { selectedPrinter } = this.state;
    let { exif } = this.state;
    console.log(selectedPrinter);
    console.log(image);
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
          <Button title="creat pdf" onPress={() => this.printPdfLib(image)} />
        </View>
      );
    }
  }
}
