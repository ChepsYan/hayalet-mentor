import { useTheme } from '../context/ThemeContext';

export default function Header({ 
  character, 
  characters, 
  onCharacterChange, 
  onClearHistory 
}) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg">
      {/* Left side - Character info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {character && (
          <>
            <img
              src={character.avatar}
              alt={character.name}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-indigo-500 shadow-lg 
                         hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                {character.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {character.description}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Right side - Controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Character selector */}
        <select
          value={character?.id || ''}
          onChange={(e) => onCharacterChange(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     text-sm font-medium cursor-pointer shadow-sm
                     hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20
                     transition-all duration-200"
        >
          {characters.map((char) => (
            <option key={char.id} value={char.id}>
              {char.name}
            </option>
          ))}
        </select>

        {/* Clear history button */}
        <button
          onClick={onClearHistory}
          className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-600 
                     bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300
                     hover:bg-red-50 hover:border-red-300 hover:text-red-500
                     dark:hover:bg-red-900/20 dark:hover:border-red-500/50 dark:hover:text-red-400
                     shadow-sm transition-all duration-200"
          title="Geçmişi Temizle"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

        {/* Theme toggle button */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-600 
                     bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300
                     hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-500
                     dark:hover:bg-indigo-900/20 dark:hover:border-indigo-500/50 dark:hover:text-indigo-400
                     shadow-sm transition-all duration-200"
          title={isDark ? 'Aydınlık Tema' : 'Karanlık Tema'}
        >
          {isDark ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
