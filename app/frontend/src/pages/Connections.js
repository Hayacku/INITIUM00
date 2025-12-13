import React, { useState } from 'react';
import { AuthButtons } from '../components/AuthButtons';

export default function Connections() {
  const [user, setUser] = useState(null);

  return (
    <div className="max-w-md mx-auto mt-16 p-8 card-modern animate-fade-in">
      <h1 className="text-3xl font-bold mb-6 text-center">Connexion</h1>
      {!user ? (
        <AuthButtons onAuth={setUser} />
      ) : (
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Bienvenue, {user.displayName || user.email} !</p>
          <img src={user.photoURL} alt="Profil" className="w-16 h-16 rounded-full mx-auto mb-4" />
          <button onClick={() => setUser(null)} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">Déconnexion</button>
        </div>
      )}
    </div>
  );
}
