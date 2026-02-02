import { useState } from 'react';
import IntroScreen from './components/IntroScreen.jsx';
import MainPage from './pages/MainPage.jsx';

export default function App() {
  const [introDone, setIntroDown] = useState(false);

  if (!introDone) {
    return <IntroScreen onComplete={() => setIntroDown(true)} />;
  }

  return <MainPage />;
}
