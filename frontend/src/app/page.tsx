import Link from 'next/link'
import { 
  WrenchScrewdriverIcon, 
  HomeIcon, 
  AcademicCapIcon, 
  SparklesIcon,
  StarIcon,
  ShieldCheckIcon,
  ClockIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <WrenchScrewdriverIcon className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">VisiPakalpojumi</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/services" className="text-gray-600 hover:text-blue-600 transition-colors">
                Pakalpojumi
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">
                Par mums
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">
                Kontakti
              </Link>
              <Link href="/auth/login" className="text-gray-600 hover:text-blue-600 transition-colors">
                Ieiet
              </Link>
              <Link 
                href="/auth/register" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reģistrēties
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Atrodiet uzticamus{' '}
              <span className="text-blue-600">pakalpojumu sniedzējus</span>
              <br />
              Latvijā
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Vienā vietā visi pakalpojumi - tīrīšana, remonts, mācības, un daudz kas cits. 
              Ātri, droši un uzticami.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/services" 
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Atrast pakalpojumu
              </Link>
              <Link 
                href="/auth/register?role=provider" 
                className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors"
              >
                Kļūt par sniedzēju
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Kāpēc izvēlēties VisiPakalpojumi?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Mēs savienojam pakalpojumu sniedzējus ar klientiem drošā un ērtā veidā
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <SparklesIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Īpašs pakalpojums</h3>
              <p className="text-gray-600">Atrodiet un rezervējiet pakalpojumus dažos klikšķos</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Drošība</h3>
              <p className="text-gray-600">Visi sniedzēji ir verificēti un apdrošināti</p>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <StarIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Atsauksmes</h3>
              <p className="text-gray-600">Īstas atsauksmes no iepriekšējiem klientiem</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClockIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Ātri</h3>
              <p className="text-gray-600">Pakalpojumi jau šodien vai rīt</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Populārākie pakalpojumi
            </h2>
            <p className="text-xl text-gray-600">
              Atrodiet to, kas jums nepieciešams
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <HomeIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Mājas tīrīšana</h3>
              <p className="text-gray-600 mb-4">Profesionāla mājas tīrīšana ar kvalitatīviem līdzekļiem</p>
              <Link href="/services?category=cleaning" className="text-blue-600 hover:text-blue-700 font-medium">
                Atrast sniedzējus →
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <WrenchScrewdriverIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Remonts</h3>
              <p className="text-gray-600 mb-4">Jebkāda veida remontdarbi - no maziem līdz lieliem</p>
              <Link href="/services?category=repair" className="text-blue-600 hover:text-blue-700 font-medium">
                Atrast sniedzējus →
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <AcademicCapIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Mācības</h3>
              <p className="text-gray-600 mb-4">Privātstundas un mācības dažādās jomās</p>
              <Link href="/services?category=education" className="text-blue-600 hover:text-blue-700 font-medium">
                Atrast sniedzējus →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Vai esat pakalpojumu sniedzējs?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Pievienojieties mums un sāciet piedāvāt savus pakalpojumus tūkstošiem klientu
          </p>
          <Link 
            href="/auth/register?role=provider" 
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Sākt sniegt pakalpojumus
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <WrenchScrewdriverIcon className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-xl font-bold">VisiPakalpojumi</span>
              </div>
              <p className="text-gray-400">
                Visi pakalpojumi vienā vietā - ātri, droši un uzticami.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Pakalpojumi</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/services?category=cleaning" className="hover:text-white">Tīrīšana</Link></li>
                <li><Link href="/services?category=repair" className="hover:text-white">Remonts</Link></li>
                <li><Link href="/services?category=education" className="hover:text-white">Mācības</Link></li>
                <li><Link href="/services" className="hover:text-white">Visi pakalpojumi</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Uzņēmumam</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/auth/register?role=provider" className="hover:text-white">Kļūt par sniedzēju</Link></li>
                <li><Link href="/about" className="hover:text-white">Par mums</Link></li>
                <li><Link href="/contact" className="hover:text-white">Kontakti</Link></li>
                <li><Link href="/help" className="hover:text-white">Palīdzība</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Juridiski</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/terms" className="hover:text-white">Lietošanas noteikumi</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privātuma politika</Link></li>
                <li><Link href="/cookies" className="hover:text-white">Cookie politika</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 VisiPakalpojumi. Visas tiesības aizsargātas.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
