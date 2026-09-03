import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Home from '@/pages/Home'

/**
 * Only the landing page is in the initial bundle. Every other route, and the
 * content it pulls in, arrives when a visitor actually asks for it.
 */
const About = lazy(() => import('@/pages/About'))
const Research = lazy(() => import('@/pages/Research'))
const TrackDetail = lazy(() => import('@/pages/TrackDetail'))
const Systems = lazy(() => import('@/pages/Systems'))
const Students = lazy(() => import('@/pages/Students'))
const PrincipalInvestigator = lazy(() => import('@/pages/PrincipalInvestigator'))
const People = lazy(() => import('@/pages/People'))
const PersonDetail = lazy(() => import('@/pages/PersonDetail'))
const Publications = lazy(() => import('@/pages/Publications'))
const News = lazy(() => import('@/pages/News'))
const Contact = lazy(() => import('@/pages/Contact'))
const NotFound = lazy(() => import('@/pages/NotFound'))

/** Holds the page height while a route chunk loads, so the footer does not jump. */
function RouteFallback() {
  return <div className="min-h-[60vh]" />
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route
          path="*"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="about" element={<About />} />
                <Route path="research" element={<Research />} />
                <Route path="research/:trackId" element={<TrackDetail />} />
                <Route path="systems" element={<Systems />} />
                <Route path="students" element={<Students />} />
                <Route path="pi" element={<PrincipalInvestigator />} />
                <Route path="people" element={<People />} />
                <Route path="people/:slug" element={<PersonDetail />} />
                <Route path="publications" element={<Publications />} />
                <Route path="news" element={<News />} />
                <Route path="contact" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          }
        />
      </Route>
    </Routes>
  )
}
