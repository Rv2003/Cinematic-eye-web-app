import { Hero } from "../components/hero";
import { Navbar } from "../components/navbar";
import  Gallery from "../components/gallery";
import {TeamSection} from "../components/members";
import {Footer} from "../components/footer";
                                                        
export function Homepage({user,setUser,token,setToken,setAuthLoading,authLoading}) {
  return (
    <>
      <Navbar user={user} setUser={setUser} token={token} setToken={setToken} setAuthloading={setAuthLoading} authLoading={authLoading}/>
      <Hero />
      <Gallery />
      <TeamSection/>
      
      <Footer />
      </>
  )
}