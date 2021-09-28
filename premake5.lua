workspace "config"  
configurations { "Debug", "Release" }
project "setup"   kind "ConsoleApp"
language "C++"
includedirs { "/home/alpha/Documents/projects/temp/BOOST/" }
files { "**.h", "src/**.cpp" }
   filter { "configurations:Debug" }     
   defines { "DEBUG" } 
   symbols "On"
   filter { "configurations:Release" }      
   defines { "NDEBUG" }      
   optimize "On"
