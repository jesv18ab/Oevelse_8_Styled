import * as React from 'react';
import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  Linking,
  FlatList,
  Button,
  Image,
} from 'react-native';
import { Camera } from 'expo-camera';
import * as Permissions from 'expo-permissions';
import * as MediaLibrary from 'expo-media-library';



export default class App extends React.Component {
  cameraRef = React.createRef();

  state = {
    hasCameraPermission: null,
    isClicked:false,
    cameraPosition:Camera.Constants.Type.front,
    lastPhoto:null,
    hasCameraRollPermission: null,
    galleryImages:null,
    showGallery: false
  };

  componentDidMount() {
    this.updateCameraPermission();
    this.updateCameraRollPermission();
  }

  updateCameraPermission = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  };

  updateCameraRollPermission = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    this.setState({ hasCameraRollPermission: status === 'granted' });
  };

  handleTakePhoto = async () => {
    if (!this.cameraRef.current) {
      return;
    }
    const result = await this.cameraRef.current.takePictureAsync();
    this.setState({ lastPhoto: result.uri });
    this.handleSaveToCameraRoll(this.state.lastPhoto)
  };

  // Gem billedet i galleriet
  handleSaveToCameraRoll = async uri => {
    try {
      await MediaLibrary.createAssetAsync(uri, 'photo');
    } catch (error) {
      console.error(error);
    }
  };




  handleChangeCamera = () =>{
    if(this.state.isClicked){
      this.setState({cameraPosition:Camera.Constants.Type.front})
      this.setState({isClicked:false})
    }else{
      this.setState({cameraPosition:Camera.Constants.Type.back})
      this.setState({isClicked:true})
    }
  }

  handleSettingLink = () =>{
    Linking.openSettings()
  }

  // Hent 3 billeder fra galleriet
  handleLoadGalleryImages = async () => {
    try {
      const result =  await MediaLibrary.getAssetsAsync({first:5});
      this.setState({ galleryImages:result.assets });
    }catch (e) {
      console.log(e)
    }
  };


  renderCameraView() {
    const { hasCameraPermission, type } = this.state;
    if (hasCameraPermission === null) {
      return <View />;
    }
    if (hasCameraPermission === false) {
      return (
          <View>
            <Text>Du har ikke adgang til kamera.</Text>
            <Button onPress={this.handleSettingLink} title='Get permissions to access camera'> </Button>
          </View>
      );
    }
    return (
        <View>
          <Camera
              style={styles.cameraView}
              type={this.state.cameraPosition}
              ref={this.cameraRef}>
          </Camera>
          <Button title="Take photo" onPress={this.handleTakePhoto} />
          <Button title="Switch camera" onPress={this.handleChangeCamera} />
        </View>
    );
  }

  renderGalleryView() {
    // Vi ingenting så længe vi venter på input fra bruger
    const { hasCameraRollPermission, galleryImages } = this.state;
    if (hasCameraRollPermission === null) {
      return <View />;
    }
    // Vis en fejlbesked og en knap til settings hvis brugeren ikke har accepteret adgang
    if (hasCameraRollPermission === false) {
      return (
          <View>
            <Text>No access to camera roll.</Text>
            <Button title="Go to settings" onPress={this.handleSettingLink} />
          </View>
      );
    }
    // Her looper vi igennem den liste af billeder som er modtaget fra CameraRoll
    return (
        <View>
          <Button title="Load images" onPress={this.handleLoadGalleryImages} />
          <View style={styles.galleryView}>
            {galleryImages && (
                <FlatList
                    horizontal
                    styles={styles.Flatlist_render}
                    data={galleryImages}
                    // Vi sender vores item, som er den enkelte user, med som prop til UserItem
                    // Vi sender også vores event handler med som prop, så UserItem ikke skal håndtere navigation
                    // this.handleSelectUser modtager en user som argument
                    renderItem={({ item }) => (
                        <Image
                            source={{ uri: item.uri}}
                            key={item.uri}
                            style={styles.FlatList_image}
                        />
                    )}
                    keyExtractor={item => item.id}
                />
            )}
          </View>
        </View>
    );
  }

  renderLastPhoto() {
    // Her viser vi det senest tagne billede
    const { lastPhoto } = this.state;
    if (!lastPhoto === null) {
      return <View />;
    }
    return (
        <View style={styles.lastPhotoContainer}>
          <Text style={{marginLeft: 160}} >Last photo</Text>
          <Image source={{ uri: lastPhoto }} style={styles.thumbnail} />
        </View>
    );
  }

  render() {

    return (
        <SafeAreaView style={styles.container}>
          <View style={styles.cameraContainer}>{this.renderCameraView()}</View>
          <View style={styles.lastPhotoContainer}>{this.renderLastPhoto()}</View>
          <View style={styles.galleryContainer}>{this.renderGalleryView()}</View>
        </SafeAreaView>);
  }
}

const containerStyle = {
  padding: 5,
  borderRadius: 1,
  margin: 4,
  borderWidth: 1,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
  },
  Flatlist_render:{
    width:'100%'
  },
  cameraContainer: {
    // Her pakkes fælles style ud
    ...containerStyle,
    backgroundColor: '#DDF',

  },
  cameraView: {
    marginTop: 70,
    marginLeft: 15,
    aspectRatio: 1.33,
    width: '100%',
    height: 270
  },
  lastPhotoContainer: {
    backgroundColor: '#DFF',
    width: '100%',
    height: 130,
    margin: 5
  },
  galleryContainer: {
    ...containerStyle,
    backgroundColor: '#FDF',
    marginBottom: 100
  },
  thumbnail: {
    width: 110,
    height: 110,
    marginLeft: 140
  },thumbnail2: {
    width: 200,
    height: 200,
    margin: 10,
  },
  FlatList_image:{
    width: 200,
    height: 200,
    margin: 5
  },
  galleryView: {
    height: 150,
    width: '100%',
    flexDirection: 'row',
  },
});
