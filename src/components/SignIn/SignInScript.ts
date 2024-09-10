import { defineComponent, ref } from 'vue';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { router } from '@/router';

export default defineComponent({
  name: 'SignIn',
  setup() {
    const email = ref('');
    const password = ref('');
    const error = ref('');

    function approveAuthentication() {
      error.value = '';
      router.push('mainMenu');
    }

    function setError(error: any) {
      error.value = `Error: ${error.message} (Code: ${error.code})`;
    }

    function signInWithEmail() {
      const auth = getAuth();

      signInWithEmailAndPassword(auth, email.value, password.value)
        .then((userCredential) => {
          approveAuthentication();
          console.log('User signed in with email:', userCredential.user);
        })
        .catch((error) => {
          setError(error);
          console.error("Error signing in with email:", error.code, error.message);
        });
    }

    function signInWithGoogle() {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();

      signInWithPopup(auth, provider)
        .then((result) => {
          approveAuthentication();
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
