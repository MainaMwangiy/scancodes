import React, { useState, useEffect } from "react";
import {
  BrowserMultiFormatReader,
  NotFoundException,
  ChecksumException,
  FormatException,
  BarcodeFormat
} from "@zxing/library";

export default function BarcodeScanner() {
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [code, setCode] = useState("");
  const [videoInputDevices, setVideoInputDevices] = useState([]);

  const codeReader = new BrowserMultiFormatReader();

  useEffect(() => {
    codeReader
      .listVideoInputDevices()
      .then(videoInputDevices => {
        setupDevices(videoInputDevices);
      })
      .catch(err => {
        console.error(err);
      });
  }, [codeReader]);

  function setupDevices(videoInputDevices) {
    // selects first device
    setSelectedDeviceId(videoInputDevices[0].deviceId);

    // setup devices dropdown
    if (videoInputDevices.length >= 1) {
      setVideoInputDevices(videoInputDevices)
    }
  }

  function resetClick() {
    codeReader.reset();
    setCode("");
    console.log("Reset.");
  }

  function decodeContinuously(selectedDeviceId) {
    codeReader.decodeFromInputVideoDeviceContinuously(
      selectedDeviceId,
      "video",
      (result, err) => {
        if (result) {
          // properly decoded qr code or barcode
          setCode(result.getText());
        }

        if (err) {

          if (err instanceof NotFoundException) {
            console.log("No barcode or QR code found.");
          }

          if (err instanceof ChecksumException) {
            console.log("A code was found, but its read value was not valid.");
          }

          if (err instanceof FormatException) {
            console.log("A code was found, but it was in an invalid format.");
          }
        }
      },
      [
        BarcodeFormat.CODE_128,
        BarcodeFormat.CODE_39,
        BarcodeFormat.CODE_93,
        BarcodeFormat.CODABAR,
        BarcodeFormat.DATA_MATRIX,
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.ITF,
        BarcodeFormat.QR_CODE,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.UPC_EAN_EXTENSION
      ],
    );
  }

  useEffect(() => {
    decodeContinuously(selectedDeviceId);
    console.log(`Started decode from camera with id ${selectedDeviceId}`);
  }, [selectedDeviceId]);

  return (
    <main className="wrapper">
      <section className="container" id="demo-content">
        <div id="sourceSelectPanel">
          <label htmlFor="sourceSelect">Change video source:</label>
          <select
            id="sourceSelect"
          >
            {
              videoInputDevices.map(element => (
                <option key={element.deviceId} value={element.deviceId}>{element.label}</option>
              ))
            }
          </select>
        </div>

        <div>
          <video id="video" width="300" height="200" />
        </div>

        <label>Result:</label>
        <pre>
          <code id="result">{code}</code>
        </pre>
        <button id="resetButton" onClick={() => resetClick()}>
          Reset
        </button>
      </section>
    </main>
  );
}
