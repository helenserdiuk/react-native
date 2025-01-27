import {
  View,
  TextInput,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";

import { Send } from "../../components/icon/icons";

import { getDatabase, ref, child, get, set } from "firebase/database";

import { useEffect, useState } from "react";

const CommentsScreen = ({ route }) => {
  const [item, setItem] = useState({});
  const [comentText, setComentText] = useState("");
  const [inputFocus, setInputFocus] = useState(false);

  const [comments, setComments] = useState([]);

  const getComments = async () => {
    await get(
      child(
        ref(getDatabase()),
        `posts/${route.params.userId}/${route.params.postId}`
      )
    )
      .then(async (snapshot) => {
        if (snapshot.exists()) {
          const data = await snapshot.val();
          setItem(data);
          if (data?.comments) {
            setComments(Object.values(data.comments));
          }
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const convertTime = (miliseconds) => {
    const date = new Date(Number(miliseconds));
    return date.toString("yyyy-MM-d-h-mm-ss");
  };

  const onSendComment = () => {
    const commentId = String(Date.now());
    set(
      ref(
        getDatabase(),
        `posts/${route.params.userId}/${route.params.postId}/comments/` +
          commentId
      ),
      {
        commentId,
        text: comentText,
        owner: route.params.name,
      }
    );
    setComentText("");
    setInputFocus(false);
    Keyboard.dismiss();
    getComments();
  };

  useEffect(() => {
    if (route.params) {
      getComments();
    }
  }, [route.params]);

  const shemaItem = ({ item }) => {
    return (
      <View style={styles.singleCommentWrapper}>
        <Text style={styles.commentOwner}>
          {item.owner}:<Text style={styles.commentText}>{item.text}</Text>
        </Text>
        <Text>{convertTime(item.commentId)}</Text>
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Image style={styles.image} source={{ uri: item.pictureUrl }} />
        {!inputFocus && (
          <View style={styles.comentsWrapper}>
            <FlatList
              data={comments}
              keyExtractor={(el, idx) => idx.toString()}
              renderItem={shemaItem}
            />
          </View>
        )}

        <KeyboardAvoidingView
          behavior={Platform.OS == "ios" ? "padding" : "height"}
        >
          <View style={styles.inputWrapper}>
            <TextInput
              value={comentText}
              onChangeText={(text) => setComentText(text)}
              multiline="true"
              placeholder="Комментировать..."
              style={inputFocus ? styles.inputFocus : styles.input}
              onFocus={() => setInputFocus(true)}
              onBlur={() => setInputFocus(false)}
            />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onSendComment}
              style={styles.button}
            >
              <Send />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    // flexDirection: "column",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  image: {
    height: 240,
    borderRadius: 8,
  },
  comentsWrapper: {
    height: 250,
    marginBottom: 15,
    marginTop: 10,
  },
  singleCommentWrapper: {
    marginBottom: 10,
    backgroundColor: "#F6F6F6",
    width: 300,
    padding: 5,
    borderRadius: 6,
  },
  inputWrapper: {
    position: "relative",
  },
  input: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    backgroundColor: "#F6F6F6",
    fontFamily: "Roboto-Regular",
    fontSize: 16,
    lineHeight: 19,
    color: "#212121",
    borderRadius: 25,
    paddingRight: 46,
  },
  inputFocus: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#FF6C00",
    backgroundColor: "#FFFFFF",
    fontFamily: "Roboto-Regular",
    fontSize: 16,
    lineHeight: 19,
    color: "#212121",
    borderRadius: 25,
    marginBottom: 100,
    paddingRight: 46,
  },
  button: {
    position: "absolute",
    right: 8,
    top: 8,

    width: 34,
    height: 34,
    backgroundColor: "#FF6C00",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default CommentsScreen;
