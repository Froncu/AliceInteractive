import { defineComponent, onMounted, ref } from 'vue';
import { authentication } from '@/../firebaseConfig.js';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { router } from '@/router';
//import { sessionId } from '@/app';

export default defineComponent({
  name: 'LoginPage',
  setup() {
    const email = ref('');
    const password = ref('');
    const error = ref('');

    onMounted(() => {
      onAuthStateChanged(authentication, (user) => {
        if (!user)
          return;

        error.value = '';
        router.push({
          name: 'mainPage',
        });
      })
    })

    function setError(error: any) {
      error.value = `Error: ${error.message} (Code: ${error.code})`;
    }

    function signInWithEmail() {
      signInWithEmailAndPassword(authentication, email.value, password.value)
        .then((userCredential) => {
          console.log('User signed in with email:', userCredential.user);
        })
        .catch((error) => {
          setError(error);
          console.error("Error signing in with email:", error.code, error.message);
        });
    }

    function signInWithGoogle() {
      signInWithPopup(authentication, new GoogleAuthProvider())
        .then((result) => {
          console.log('User signed in with Google:', result.user);
        })
        .catch((error) => {
          setError(error);
          console.error("Error signing in with Google:", error.code, error.message);
        });
    }

    return {
      email,
      password,
      error,
      signInWithEmail,
      signInWithGoogle,
    };
  }
});
