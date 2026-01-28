#!/bin/bash

# Supabase Setup Script for Subagents Platform
# This script sets up the complete Supabase database schema and configuration

set -e

echo "🚀 Setting up Supabase for Subagents Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    echo "or"
    echo "brew install supabase/tap/supabase"
    exit 1
fi

print_success "Supabase CLI found"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Initialize Supabase project if not already initialized
if [ ! -f "supabase/config.toml" ]; then
    print_status "Initializing Supabase project..."
    supabase init
    
    # Copy our custom config
    if [ -f "supabase/config.toml.backup" ]; then
        mv supabase/config.toml.backup supabase/config.toml
    fi
else
    print_success "Supabase project already initialized"
fi

# Start Supabase local development
print_status "Starting Supabase local development environment..."
supabase start

# Get the local Supabase URLs and keys
print_status "Getting local Supabase configuration..."
API_URL=$(supabase status | grep "API URL" | awk '{print $3}')
ANON_KEY=$(supabase status | grep "anon key" | awk '{print $3}')
SERVICE_ROLE_KEY=$(supabase status | grep "service_role key" | awk '{print $3}')

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    print_status "Creating .env.local file..."
    cat > .env.local << EOF
# Supabase Configuration (Local Development)
NEXT_PUBLIC_SUPABASE_URL=$API_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Subagents.sh"

# GitHub OAuth (Set these up in your GitHub OAuth app)
# GITHUB_CLIENT_ID=your_github_client_id
# GITHUB_SECRET=your_github_secret
EOF
    print_success "Created .env.local file"
else
    print_warning ".env.local already exists, skipping creation"
fi

# Run database migrations
print_status "Running database migrations..."
if supabase db reset; then
    print_success "Database migrations completed successfully"
else
    print_error "Database migrations failed"
    exit 1
fi

# Generate TypeScript types
print_status "Generating TypeScript types..."
if supabase gen types typescript --local > src/types/supabase.ts; then
    print_success "TypeScript types generated successfully"
else
    print_warning "Failed to generate TypeScript types, but continuing..."
fi

# Display final status
print_success "Supabase setup completed successfully!"
echo ""
echo "📊 Your local Supabase instance is running at:"
echo "   Dashboard: http://localhost:54323"
echo "   API URL: $API_URL"
echo ""
echo "🔑 Keys (already added to .env.local):"
echo "   Anon Key: $ANON_KEY"
echo "   Service Role Key: $SERVICE_ROLE_KEY"
echo ""
echo "📝 Next steps:"
echo "   1. Update GitHub OAuth credentials in .env.local if needed"
echo "   2. Run 'npm run dev' to start your Next.js application"
echo "   3. Visit http://localhost:3000 to see your application"
echo ""
echo "🛠  Useful commands:"
echo "   supabase status    - Check Supabase status"
echo "   supabase stop      - Stop Supabase services"
echo "   supabase db reset  - Reset database (re-run migrations and seed)"
echo ""

# Check if the sample data was loaded correctly
print_status "Verifying database setup..."
AGENTS_COUNT=$(supabase db query "SELECT COUNT(*) FROM public.agents;" --local | tail -n 1 | tr -d ' ')
CATEGORIES_COUNT=$(supabase db query "SELECT COUNT(*) FROM public.categories;" --local | tail -n 1 | tr -d ' ')

if [ "$AGENTS_COUNT" -gt 0 ] && [ "$CATEGORIES_COUNT" -gt 0 ]; then
    print_success "Database verification successful:"
    echo "   - $CATEGORIES_COUNT categories loaded"
    echo "   - $AGENTS_COUNT sample agents loaded"
else
    print_warning "Database verification failed. You may need to run the seed data manually."
fi

print_success "Setup complete! 🎉"