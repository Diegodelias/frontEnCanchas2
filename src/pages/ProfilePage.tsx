import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { ProfileView } from '../components/profile/ProfileView';

export const ProfilePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <Navbar />
      <main className="flex-1">
        <ProfileView />
      </main>
    </div>
  );
};
