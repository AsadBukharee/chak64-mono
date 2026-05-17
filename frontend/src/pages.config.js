import Feed from './pages/Feed';
import Teams from './pages/Teams';
import Polls from './pages/Polls';
import Campaigns from './pages/Campaigns';
import CampaignDetails from './pages/CampaignDetails';
import Donate from './pages/Donate';
import SponsorFund from './pages/SponsorFund';
import About from './pages/About';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminPolls from './pages/AdminPolls';
import AdminCampaigns from './pages/AdminCampaigns';
import AdminDonations from './pages/AdminDonations';
import AdminSponsors from './pages/AdminSponsors';
import AdminAbout from './pages/AdminAbout';
import AdminAds from './pages/AdminAds';
import Live from './pages/Live';
import Profile from './pages/Profile';
import DeveloperGuide from './pages/DeveloperGuide';
import PostmanCollection from './pages/PostmanCollection';
import Admin from './pages/Admin';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './Layout.jsx';

export const PAGES = {
    "Feed": Feed,
    "Teams": Teams,
    "Polls": Polls,
    "Campaigns": Campaigns,
    "CampaignDetails": CampaignDetails,
    "Donate": Donate,
    "SponsorFund": SponsorFund,
    "About": About,
    "AdminDashboard": AdminDashboard,
    "AdminUsers": AdminUsers,
    "AdminPolls": AdminPolls,
    "AdminCampaigns": AdminCampaigns,
    "AdminDonations": AdminDonations,
    "AdminSponsors": AdminSponsors,
    "AdminAbout": AdminAbout,
    "AdminAds": AdminAds,
    "Live": Live,
    "Profile": Profile,
    "DeveloperGuide": DeveloperGuide,
    "PostmanCollection": PostmanCollection,
    "Admin": Admin,
    "Home": Home,
    "Login": Login,
    "Register": Register,
}

export const pagesConfig = {
    mainPage: "Feed",
    Pages: PAGES,
    Layout: Layout,
};