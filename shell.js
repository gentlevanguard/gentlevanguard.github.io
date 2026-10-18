// Adapted from Service Desk's homologated GV shell. Shared preference keys.
(() => {
  const read = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const write = (key, value) => { try { localStorage.setItem(key, value); } catch { /* Preferences are optional. */ } };
  const savedLang = read('gv-cc-lang');
  const savedTheme = read('gv-cc-theme');
  const language = document.querySelector('#language');
  const languageControl = language.closest('.language-control');
  let languageByPointer = false;
  document.addEventListener('pointerdown', event => {
    languageByPointer = languageControl.contains(event.target);
    languageControl.dataset.input = 'pointer';
  });
  document.addEventListener('keydown', () => {
    languageByPointer = false;
    languageControl.dataset.input = 'keyboard';
  });
  document.documentElement.lang = ['es','en','pt'].includes(savedLang) ? savedLang : 'es';
  document.documentElement.dataset.theme = ['light','dark'].includes(savedTheme) ? savedTheme : 'dark';
  document.querySelector('#language').value = document.documentElement.lang;
  document.querySelector('#language').addEventListener('change', event => {
    document.documentElement.lang = event.target.value;
    write('gv-cc-lang', event.target.value);
    window.dispatchEvent(new Event('gv-language'));
    if (languageByPointer) { language.blur(); languageByPointer = false; }
  });
  document.querySelector('#theme').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    write('gv-cc-theme', next);
    window.dispatchEvent(new Event('gv-theme'));
  });
})();
