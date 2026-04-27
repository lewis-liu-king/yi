import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/store';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ConversationListPage from './pages/ConversationListPage';
import ConversationDetailPage from './pages/ConversationDetailPage';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/conversations" element={<ProtectedRoute><ConversationListPage /></ProtectedRoute>} />
            <Route path="/conversations/:id" element={<ProtectedRoute><ConversationDetailPage /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/conversations" />} />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;