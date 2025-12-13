import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Button } from './ui/button';

export function AuthButtons({ onAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  const handleGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onAuth(result.user);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let userCred;
      if (isSignUp) {
        userCred = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCred = await signInWithEmailAndPassword(auth, email, password);
      }
      onAuth(userCred.user);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <Button onClick={handleGoogle} className="w-full bg-blue-500 text-white mb-2">
        Se connecter avec Google
      </Button>
      <form onSubmit={handleEmail} className="space-y-3">
        <input
          type="email"
          placeholder="Adresse mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <Button type="submit" className="w-full">
          {isSignUp ? 'Créer un compte' : 'Connexion'}
        </Button>
      </form>
      <div className="text-center">
        <button
          type="button"
          className="text-blue-500 underline text-sm"
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp ? 'Déjà inscrit ? Se connecter' : 'Pas de compte ? Créer un compte'}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
    </div>
  );
}
