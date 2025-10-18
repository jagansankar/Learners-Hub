import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
export default function TabLayout() {
  return (
    <Tabs screenOptions={{
        headerShown:false
    }}>
        <Tabs.Screen name="home" 
        options={{
            tabBarIcon:({color,size})=><Ionicons name="home-outline" size={size} color={color} />,
            tabBarLabel:'HOME'
        }}
        />
        <Tabs.Screen name="explore" 
         options={{
            tabBarIcon:({color,size})=><Ionicons name="search-circle-outline" size={size} color={color} />,
            tabBarLabel:'EXPLORE'
        }}
        />
        <Tabs.Screen name="progress" 
        options={{
            tabBarIcon:({color,size})=><Ionicons name="analytics-outline" size={size} color={color} />,
            tabBarLabel:'PROGRESS'
        }}
        />
        <Tabs.Screen name="profile" 
        options={{
            tabBarIcon:({color,size})=><Ionicons name="person-circle-outline" size={size} color={color} />,
            tabBarLabel:'PROFILE'
        }}
        />
    </Tabs>
  )
}