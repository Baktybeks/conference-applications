"use client";

import React from "react";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Activity,
  Calendar,
  Users,
  FileText,
} from "lucide-react";

export function SystemAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Системная аналитика
        </h2>
        <div className="flex space-x-2">
          <select className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="week">За неделю</option>
            <option value="month">За месяц</option>
            <option value="quarter">За квартал</option>
            <option value="year">За год</option>
          </select>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition-colors">
            Экспорт отчета
          </button>
        </div>
      </div>

      {/* Основные графики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Регистрации пользователей
            </h3>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="h-48 bg-gradient-to-r from-green-50 to-green-100 rounded flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">+24%</div>
              <p className="text-sm text-gray-600">Рост за месяц</p>
              <div className="mt-4 space-y-1">
                <div className="text-xs text-gray-500">
                  Новые пользователи: 156
                </div>
                <div className="text-xs text-gray-500">Активация: 89%</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Подача заявок</h3>
            <BarChart3 className="h-5 w-5 text-blue-500" />
          </div>
          <div className="h-48 bg-gradient-to-r from-blue-50 to-blue-100 rounded flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">847</div>
              <p className="text-sm text-gray-600">Заявок за месяц</p>
              <div className="mt-4 space-y-1">
                <div className="text-xs text-gray-500">Принято: 523 (62%)</div>
                <div className="text-xs text-gray-500">
                  На рассмотрении: 127
                </div>
                <div className="text-xs text-gray-500">Отклонено: 197</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Распределение по ролям
            </h3>
            <PieChart className="h-5 w-5 text-purple-500" />
          </div>
          <div className="h-48 bg-gradient-to-r from-purple-50 to-purple-100 rounded flex items-center justify-center">
            <div className="text-center">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                    Участники
                  </span>
                  <span className="font-medium">68%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    Организаторы
                  </span>
                  <span className="font-medium">18%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    Рецензенты
                  </span>
                  <span className="font-medium">12%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    Админы
                  </span>
                  <span className="font-medium">2%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Детальная аналитика */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Активность конференций
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">
                    Активные конференции
                  </div>
                  <div className="text-sm text-gray-500">
                    Проходят в данный момент
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-600">8</div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">
                    Средняя посещаемость
                  </div>
                  <div className="text-sm text-gray-500">
                    За последний месяц
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold text-green-600">87%</div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-orange-500 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">
                    Заявок на рассмотрении
                  </div>
                  <div className="text-sm text-gray-500">Требуют действий</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-orange-600">127</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Тренды и прогнозы
          </h3>
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4">
              <div className="font-medium text-gray-900">Рост участников</div>
              <div className="text-sm text-gray-600 mt-1">
                +24% в этом месяце по сравнению с предыдущим
              </div>
              <div className="text-xs text-green-600 mt-1">
                ↗ Положительная тенденция
              </div>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <div className="font-medium text-gray-900">Качество заявок</div>
              <div className="text-sm text-gray-600 mt-1">
                Коэффициент принятия: 62% (выше среднего)
              </div>
              <div className="text-xs text-blue-600 mt-1">
                → Стабильный уровень
              </div>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <div className="font-medium text-gray-900">
                Время рецензирования
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Среднее время: 5.2 дня (цель: &lt;7 дней)
              </div>
              <div className="text-xs text-yellow-600 mt-1">
                ⚠ Требует внимания
              </div>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <div className="font-medium text-gray-900">
                Прогноз на следующий месяц
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Ожидается ~950 новых заявок (+12%)
              </div>
              <div className="text-xs text-purple-600 mt-1">
                📈 Прогнозируемый рост
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Таблица топ конференций */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Топ конференций по популярности
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Конференция
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Заявки
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Принято
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Рейтинг
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    AI in Healthcare 2024
                  </div>
                  <div className="text-sm text-gray-500">Медицина</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  234
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  156 (67%)
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex text-yellow-400">★★★★★</div>
                    <span className="ml-2 text-sm text-gray-600">4.8</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  15-17 апр
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    Digital Education Summit
                  </div>
                  <div className="text-sm text-gray-500">Образование</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  189
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  123 (65%)
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex text-yellow-400">★★★★☆</div>
                    <span className="ml-2 text-sm text-gray-600">4.6</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  20-22 мая
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    Green Engineering Conference
                  </div>
                  <div className="text-sm text-gray-500">Инженерия</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  167
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  89 (53%)
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex text-yellow-400">★★★★☆</div>
                    <span className="ml-2 text-sm text-gray-600">4.4</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  10-12 июн
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Заглушка для будущей расширенной аналитики */}
      <div className="text-center py-12 bg-white rounded-lg shadow-md">
        <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Расширенная аналитика
        </h3>
        <p className="text-gray-600 mb-4">
          Интерактивные графики, детальная аналитика и машинное обучение будут
          доступны в следующей версии
        </p>
        <div className="flex justify-center space-x-4">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
            Запросить демо
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
            Узнать больше
          </button>
        </div>
      </div>
    </div>
  );
}
