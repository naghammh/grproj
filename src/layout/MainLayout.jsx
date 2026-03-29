import React from 'react'
import Navbar from '../components/navbar/Navbar'
import Footer from '../components/footer/Footer'
import { Outlet } from 'react-router-dom'
import ScrollToTop from '../ScrollToTop'

export default function Layout() {
  return (<>
  <ScrollToTop />
  <Navbar />
  <Outlet/>
  <Footer /> 
  </>
  )
}
