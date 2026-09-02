import { Route, Routes } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Home from '@/pages/Home'
import About from '@/pages/About'
import Research from '@/pages/Research'
import TrackDetail from '@/pages/TrackDetail'
import People from '@/pages/People'
import PrincipalInvestigator from '@/pages/PrincipalInvestigator'
import PersonDetail from '@/pages/PersonDetail'
import Publications from '@/pages/Publications'
import News from '@/pages/News'
import Contact from '@/pages/Contact'
import NotFound from '@/pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="research" element={<Research />} />
        <Route path="research/:trackId" element={<TrackDetail />} />
        <Route path="pi" element={<PrincipalInvestigator />} />
        <Route path="people" element={<People />} />
        <Route path="people/:slug" element={<PersonDetail />} />
        <Route path="publications" element={<Publications />} />
        <Route path="news" element={<News />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
