import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { useState } from "react";
import { UserDetailContext } from './../context/UserDetailContext';

export default function RootLayout() {

const [loaded, error] = useFonts({
    'outfit':require('./../assets/fonts/Outfit-Regular.ttf'),
    'outfit-bold':require('./../assets/fonts/Outfit-Bold.ttf')
  })  

  const [userDetail,setUserDetail]=useState();
  return (
      <UserDetailContext.Provider value={{userDetail,setUserDetail}}>
      <Stack screenOptions={{
         headerShown: false
      }}>

    </Stack>
    </UserDetailContext.Provider>
  )
}
