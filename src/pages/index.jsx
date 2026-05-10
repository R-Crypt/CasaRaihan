import Layout from "./Layout.jsx";

import Home from "./Home";
import Rooms from "./Rooms";
import AdminDashboard from "./AdminDashboard";
import Profile from "./Profile";
import Login from "./Login";
import PrivacyPolicy from "./PrivacyPolicy";
import TermsAndConditions from "./TermsAndConditions";
import RefundPolicy from "./RefundPolicy";
import CookiePolicy from "./CookiePolicy";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    Home: Home,
    Rooms: Rooms,
    AdminDashboard: AdminDashboard,
    Profile: Profile,
    Login: Login,
    PrivacyPolicy: PrivacyPolicy,
    TermsAndConditions: TermsAndConditions,
    RefundPolicy: RefundPolicy,
    CookiePolicy: CookiePolicy,
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                <Route path="/" element={<Home />} />
                <Route path="/Home" element={<Home />} />
                <Route path="/Rooms" element={<Rooms />} />
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
                <Route path="/Profile" element={<Profile />} />
                <Route path="/Login" element={<Login />} />
                <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
                <Route path="/TermsAndConditions" element={<TermsAndConditions />} />
                <Route path="/RefundPolicy" element={<RefundPolicy />} />
                <Route path="/CookiePolicy" element={<CookiePolicy />} />
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}