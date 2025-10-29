import React, { useState, useMemo } from 'react';
import { Search, Plus, X, Layout } from 'lucide-react';

// Initial Dashboard Data
const initialDashboardData = {
  categories: [
    {
      id: 'cspm',
      name: 'CSPM Executive Dashboard',
      widgets: [
        {
          id: 'w1',
          name: 'Cloud Accounts',
          text: 'Total: 2 Connected (2 AWS, 0 Azure)',
        },
        {
          id: 'w2',
          name: 'Cloud Account Risk Assessment',
          text: 'Failed: 1689 (7253), Warning: 681 (3620), Not Available: 36, Passed: 7253',
        },
      ],
    },
    {
      id: 'cwpp',
      name: 'CWPP Dashboard',
      widgets: [
        {
          id: 'w3',
          name: 'Top 5 Namespace Specific Alerts',
          text: 'No Graph data available!',
        },
        {
          id: 'w4',
          name: 'Workload Alerts',
          text: 'Critical: 12, High: 34, Medium: 89',
        },
      ],
    },
    {
      id: 'registry',
      name: 'Registry Scan',
      widgets: [
        {
          id: 'w5',
          name: 'Image Risk Assessment',
          text: 'Total Vulnerabilities: 1470, Critical: 9, High: 150',
        },
        {
          id: 'w6',
          name: 'Image Security Issues',
          text: 'Total Images: 520, Vulnerable: 287',
        },
      ],
    },
  ],
};

// Zustand-like store using React Context
const DashboardContext = React.createContext();

function DashboardProvider({ children }) {
  const [categories, setCategories] = useState(initialDashboardData.categories);

  const addWidget = (categoryId, widget) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              widgets: [
                ...cat.widgets,
                { ...widget, id: `w${Date.now()}` },
              ],
            }
          : cat
      )
    );
  };

  const removeWidget = (categoryId, widgetId) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              widgets: cat.widgets.filter((w) => w.id !== widgetId),
            }
          : cat
      )
    );
  };

  return (
    <DashboardContext.Provider value={{ categories, addWidget, removeWidget }}>
      {children}
    </DashboardContext.Provider>
  );
}

function useDashboard() {
  const context = React.useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
}

// Widget Component
function Widget({ widget, categoryId, onRemove }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 relative min-h-[160px] flex flex-col">
      <button
        onClick={() => onRemove(categoryId, widget.id)}
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
        aria-label="Remove widget"
      >
        <X size={18} />
      </button>
      <h3 className="font-semibold text-gray-800 mb-3 pr-6">{widget.name}</h3>
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-gray-600 text-center">{widget.text}</p>
      </div>
    </div>
  );
}

// Add Widget Modal
function AddWidgetModal({ isOpen, onClose, categoryId, categoryName }) {
  const { addWidget } = useDashboard();
  const [widgetName, setWidgetName] = useState('');
  const [widgetText, setWidgetText] = useState('');

  const handleSubmit = () => {
    if (widgetName.trim() && widgetText.trim()) {
      addWidget(categoryId, {
        name: widgetName.trim(),
        text: widgetText.trim(),
      });
      setWidgetName('');
      setWidgetText('');
      onClose();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Add Widget</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Add widget to: <span className="font-semibold">{categoryName}</span>
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Widget Name
            </label>
            <input
              type="text"
              value={widgetName}
              onChange={(e) => setWidgetName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter widget name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Widget Text
            </label>
            <textarea
              value={widgetText}
              onChange={(e) => setWidgetText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Enter widget description"
              rows={4}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Widget
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Category Component
function Category({ category }) {
  const { removeWidget } = useDashboard();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">{category.name}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {category.widgets.map((widget) => (
          <Widget
            key={widget.id}
            widget={widget}
            categoryId={category.id}
            onRemove={removeWidget}
          />
        ))}
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-white rounded-lg p-4 shadow-sm border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all min-h-[160px] flex flex-col items-center justify-center group"
        >
          <div className="bg-gray-100 group-hover:bg-blue-100 rounded-full p-3 mb-2">
            <Plus className="text-gray-600 group-hover:text-blue-600" size={24} />
          </div>
          <span className="text-gray-600 group-hover:text-blue-600 font-medium">
            Add Widget
          </span>
        </button>
      </div>
      <AddWidgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categoryId={category.id}
        categoryName={category.name}
      />
    </div>
  );
}

// Search Bar Component
function SearchBar({ searchTerm, onSearchChange }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search widgets..."
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

// Main Dashboard Component
function Dashboard() {
  const { categories } = useDashboard();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;

    return categories
      .map((category) => ({
        ...category,
        widgets: category.widgets.filter(
          (widget) =>
            widget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            widget.text.toLowerCase().includes(searchTerm.toLowerCase())
        ),
      }))
      .filter((category) => category.widgets.length > 0);
  }, [categories, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Layout className="text-blue-600" size={28} />
              <h1 className="text-2xl font-bold text-gray-900">
                CNAPP Dashboard
              </h1>
            </div>
          </div>
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {searchTerm && (
          <div className="mb-4 text-sm text-gray-600">
            Showing results for "{searchTerm}"
          </div>
        )}
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <Category key={category.id} category={category} />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No widgets found</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Main App Component
export default function App() {
  return (
    <DashboardProvider>
      <Dashboard />
    </DashboardProvider>
  );
}
