/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Blog from './pages/Blog';
import PostView from './pages/PostView';
import Videos from './pages/Videos';
import Admin from './pages/Admin';
import CookieBanner from './components/CookieBanner';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/post/:id" element={<PostView />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <CookieBanner />
      </div>
    </BrowserRouter>
  );
}
