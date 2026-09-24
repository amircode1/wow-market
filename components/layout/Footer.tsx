import Link from 'next/link';
import { Github, Twitter, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">W</span>
              </div>
              <span className="font-bold">WoW Market Tracker</span>
            </div>
            <p className="text-sm text-text-secondary">
              Professional auction house price tracking for World of Warcraft.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/items" className="text-text-secondary hover:text-primary transition-colors">
                  Browse Items
                </Link>
              </li>
              <li>
                <Link href="/watchlist" className="text-text-secondary hover:text-primary transition-colors">
                  Watchlist
                </Link>
              </li>
              <li>
              </li>
              <li>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/realms" className="text-text-secondary hover:text-primary transition-colors">
                  Realm Selection
                </Link>
              </li>
              <li>
                <Link href="/settings" className="text-text-secondary hover:text-primary transition-colors">
                  Settings
                </Link>
              </li>
              <li>
                <a 
                  href="https://develop.battle.net/documentation/world-of-warcraft" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-text-secondary hover:text-primary transition-colors"
                >
                  Blizzard API Docs
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h3 className="font-semibold">Connect</h3>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-primary transition-colors"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-primary transition-colors"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-text-secondary">
            © {new Date().getFullYear()} WoW Market Tracker. All rights reserved.
          </p>
          <div className="flex items-center space-x-1 text-sm text-text-secondary mt-4 sm:mt-0">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500" />
            <span>for the WoW community</span>
          </div>
        </div>

        <div className="mt-4 text-xs text-text-tertiary">
          <p>
            This application is not affiliated with Blizzard Entertainment. 
            World of Warcraft is a trademark of Blizzard Entertainment.
          </p>
          <p className="mt-2">
            Data provided by Blizzard Battle.net API. Prices are updated hourly.
          </p>
        </div>
      </div>
    </footer>
  );
}
