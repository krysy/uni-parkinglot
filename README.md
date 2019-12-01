# IOT lab parking space detector

## Webserver & Frontend

In order to build and use both parts you need the nodejs runtime and some additional packages. You should use a package manager for this.
You will need both Node and Yarn in order to build these parts.
On Mac you should be able to install both using 
    brew install node
    brew instal yarn

The webserver hosts the frontend, you need to build the frontend first using the build-frontend.sh script,
then you can start the server with the launch-server.sh, it automatically runs on port 8080 but that can be changed in the webserver/config.ts file by changing the port variable.

### Adding parking lots

In order to add a new parking lot you need to add a following command to the webserver/config.ts file with the desired parameters.
    lots.push(new ParkingLot("NAME", "APIKEY"));
The API key must be unique!

## Platformio Arduino

In order to upload the code to the board the PlatformIO core will be enough, you can get it here https://platformio.org/install/cli. Then go to the project folder type platformio lib install to install libraries and then use platformio run and then platformio run --target upload to upload the program to the arduino. Then connect the Arduino board the the Android Things board.

// CONNECTION DIAGRAM HERE!

## Android Things

In order to build and upload this part of the project you will need Android Studio https://developer.android.com/studio. Then open the androidthings project in it. Connect the android things board to your computer through the USB-C and wait until it shows up in the board selector. Then Press the run button to upload the project.