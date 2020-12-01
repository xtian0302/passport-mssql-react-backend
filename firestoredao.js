const admin = require("firebase-admin");

const serviceAccount = require("./dev-test-25bc6-firebase-adminsdk-hxe8h-af23768f71.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const docRef = db.collection("users");

insertDoc = async () => {
  await docRef.add({
    first: "Ada",
    last: "Lovelace",
    born: 1815,
  });
};

// try {
//   insertDoc();
// } catch (error) {
//   console.error(error);
// }

getDocs = async () => {
  //   const snapshot = await db.collection("users").get();
  //   snapshot.forEach((doc) => {
  //     console.log(doc.id, "=>", doc.data());
  //   });

  const usersRef = db.collection("users");
  const shot = await usersRef.where("first", "==", "asd").get();
  if (shot.empty) {
    console.log("No matching documents.");
    return;
  }
  shot.forEach((doc) => {
    console.log("Dude we found one! : ", doc.id, "=>", doc.data().born);
  });
};

try {
  getDocs();
} catch (error) {
  console.error(error);
}
