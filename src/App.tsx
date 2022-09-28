import './App.css';
import './widgets/common.css'
import { SelectUserPage } from './widgets/select_user_page';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Dashboard } from './widgets/dashboard';
import { friendsGetterService, FriendsGetterServiceContext, userDemoRepository, UserRepositoryContext } from './context';

function App() {
  return (
    <div className="App">
      
      <UserRepositoryContext.Provider value={ userDemoRepository }>
        <FriendsGetterServiceContext.Provider value={ friendsGetterService }>
          <HashRouter>
            <Routes>
              <Route path="/" element={<SelectUserPage />} />
              <Route path="/dashboard/*" element={<Dashboard />} />
            </Routes>
          </HashRouter>
        </FriendsGetterServiceContext.Provider>
      </UserRepositoryContext.Provider>
    </div>
  );
}

export default App;
