'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { T, Lang, Trans } from '@/lib/translations';

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Trans;
}

const LangContext = createContext<LangCtx>({ lang: 'en', setLang: () => {}, t: T.en as Trans });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    const stored = localStorage.getItem('csn-lang') as Lang | null;
    const urlParam = new URLSearchParams(window.location.search).get('lang') as Lang | null;
    const resolved = urlParam === 'sv' || urlParam === 'en' ? urlParam : stored;
    if (resolved === 'sv' || resolved === 'en') setLangState(resolved);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem('csn-lang', l);
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t: T[lang] as Trans }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LangContext);
}
