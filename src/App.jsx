import { Routes,Route} from 'react-router'
import { useState } from 'react';
import { Profile } from './webpages/profile';
import {ProtectedRoutes} from './utils/protectedroutes';
import './App.css'
import { Homepage } from './webpages/homepage'
import{Login} from "./webpages/loginpage";
import { Booking } from './webpages/booking';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useEffect } from 'react';
import  axios from 'axios';
const CLIENT_ID="806438665621-ot0fnvqdvp6irvj2nfme3ue53d8ic77o.apps.googleusercontent.com"

function App() {
  
 const [user,setUser]=useState(null)
 const [token,setToken]=useState(null )
 const [authLoading,setAuthLoading]=useState(true)

 useEffect(() => {
  const restoreSession = async () => {
    try {
      const response = await axios.post('http://localhost:5500/api/v1/auth/refresh', {}, { withCredentials: true });
      setToken(response.data.data.token);
      setUser(response.data.data.user);
    } catch (error) {
      // no valid refresh cookie — genuinely logged out
      setToken(null);
      setUser(null);
    }finally{
  setAuthLoading(false);
    }
  };

  restoreSession();
}, []);
  return (
    <>
    <GoogleOAuthProvider clientId={CLIENT_ID}>
   <Routes>
   
    <Route path='/' element={<Homepage user={user} setUser={setUser} token={token} setToken={setToken} setAuthloading={setAuthLoading} authLoading={authLoading}/>}></Route>
     <Route path='/login' element={<Login  user={user} setUser={setUser} token={token} setToken={setToken}/>}></Route>
     <Route path='/booking' element={<Booking user={user} setUser={setUser} token={token} setToken={setToken} setAuthloading={setAuthLoading} authLoading={authLoading}/>}></Route>
     
     
     <Route  element={<ProtectedRoutes user={user} authLoading={authLoading}/>}>
     <Route  path='/profile' element={<Profile token={token} setAuthloading={setAuthLoading} authLoading={authLoading}  setUser={setUser} setToken={setToken}/>}/>
     </Route>


    </Routes>
      
  </GoogleOAuthProvider>
      </>
    
  )
}

export default App
