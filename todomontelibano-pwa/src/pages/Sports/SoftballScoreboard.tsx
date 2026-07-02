import React from 'react';
import type { LineScore } from '../../types/sports';

interface Props {
  lineScore: LineScore;
  homeName?: string;
  awayName?: string;
  regulationInnings?: number;
}

/**
 * Line score clásico de softbol/béisbol: entradas en columnas, equipos en filas,
 * y totales de Carreras (R), Hits (H) y Errores (E) a la derecha.
 * El visitante batea en la parte alta (fila superior); el local en la baja.
 */
const SoftballScoreboard: React.FC<Props> = ({
  lineScore,
  homeName = 'Local',
  awayName = 'Visitante',
  regulationInnings = 7,
}) => {
  const columns = Math.max(lineScore.innings_count, regulationInnings);
  const inningNumbers = Array.from({ length: columns }, (_, i) => i + 1);

  const cell = (side: LineScore['home'], n: number) => {
    const item = side.line[n - 1];
    if (!item || !item.played) {
      return <span className="text-gray-300 dark:text-gray-600">·</span>;
    }
    return <span className="tabular-nums">{item.runs ?? 0}</span>;
  };

  const homeWins = lineScore.home.runs > lineScore.away.runs;
  const awayWins = lineScore.away.runs > lineScore.home.runs;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200/80 dark:border-gray-800/80 overflow-hidden">
      <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-800">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm">Pizarra por entradas</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
              <th className="text-left font-semibold px-4 py-2 sticky left-0 bg-white dark:bg-gray-900">
                Equipo
              </th>
              {inningNumbers.map((n) => (
                <th key={n} className="text-center font-semibold px-2.5 py-2 min-w-[2rem]">
                  {n}
                </th>
              ))}
              <th className="text-center font-bold px-2.5 py-2 border-l border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200">
                R
              </th>
              <th className="text-center font-bold px-2.5 py-2 text-gray-700 dark:text-gray-200">H</th>
              <th className="text-center font-bold px-2.5 py-2 text-gray-700 dark:text-gray-200">E</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-50 dark:border-gray-800/60">
              <td className="text-left font-semibold px-4 py-2.5 text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-900 truncate max-w-[10rem]">
                {awayName}
              </td>
              {inningNumbers.map((n) => (
                <td key={n} className="text-center px-2.5 py-2.5 text-gray-700 dark:text-gray-300">
                  {cell(lineScore.away, n)}
                </td>
              ))}
              <td className={`text-center px-2.5 py-2.5 font-black border-l border-gray-200 dark:border-gray-700 ${awayWins ? 'text-violet-600 dark:text-violet-400' : 'text-gray-900 dark:text-white'}`}>
                {lineScore.away.runs}
              </td>
              <td className="text-center px-2.5 py-2.5 text-gray-600 dark:text-gray-400 tabular-nums">{lineScore.away.hits}</td>
              <td className="text-center px-2.5 py-2.5 text-gray-600 dark:text-gray-400 tabular-nums">{lineScore.away.errors}</td>
            </tr>
            <tr>
              <td className="text-left font-semibold px-4 py-2.5 text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-900 truncate max-w-[10rem]">
                {homeName}
              </td>
              {inningNumbers.map((n) => (
                <td key={n} className="text-center px-2.5 py-2.5 text-gray-700 dark:text-gray-300">
                  {cell(lineScore.home, n)}
                </td>
              ))}
              <td className={`text-center px-2.5 py-2.5 font-black border-l border-gray-200 dark:border-gray-700 ${homeWins ? 'text-violet-600 dark:text-violet-400' : 'text-gray-900 dark:text-white'}`}>
                {lineScore.home.runs}
              </td>
              <td className="text-center px-2.5 py-2.5 text-gray-600 dark:text-gray-400 tabular-nums">{lineScore.home.hits}</td>
              <td className="text-center px-2.5 py-2.5 text-gray-600 dark:text-gray-400 tabular-nums">{lineScore.home.errors}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SoftballScoreboard;
