# VisiPakalpojumi Deployment Guide

This guide explains how to deploy the VisiPakalpojumi web application using the provided scripts.

## Prerequisites

- Ubuntu 24.04 or later
- Root access to the server
- Internet connection for package installation

## Quick Deployment

### 1. Install Dependencies

Run the installation script as root to install all required packages:

```bash
sudo ./install.sh
```

This script will:
- Update system packages
- Install Node.js 20.x
- Install PostgreSQL 17
- Install Nginx
- Install PM2 process manager
- Configure firewall
- Install Certbot for SSL certificates

### 2. Setup Application

Run the setup script to copy files and configure the database:

```bash
sudo ./setup.sh
```

This script will:
- Copy backend and frontend files to `/var/www/visipakalpojumi`
- Create PostgreSQL database and user
- Generate Prisma client
- Run database migrations
- Create environment configuration

### 3. Start Application

Start the application:

```bash
cd /var/www/visipakalpojumi
sudo ./start.sh
```

This script will:
- Install Node.js dependencies
- Start the backend server on port 3001 (publicly accessible)
- Configure Nginx as a reverse proxy
- Start all services

### 4. Stop Application

Stop the application when needed:

```bash
cd /var/www/visipakalpojumi
sudo ./stop.sh
```

## Configuration

### Environment Variables

Edit `/var/www/visipakalpojumi/backend/.env` to configure:

- Database connection
- JWT secrets
- Email settings (SendGrid)
- Payment settings (Stripe)
- File upload settings

### Database

The application uses PostgreSQL with the following default settings:
- Database: `visipakalpojumi`
- User: `visipakalpojumi_user`
- Password: `visipakalpojumi_password`

### Network Access

The application is configured to be publicly accessible:
- Backend API: `http://your-server-ip:3001`
- Web interface: `http://your-server-ip:80`
- Health check: `http://your-server-ip:3001/health`

## Security Considerations

### Firewall

The installation script configures UFW firewall with:
- SSH access
- HTTP (port 80)
- HTTPS (port 443)
- Backend API (port 3001)

### SSL Certificate

To enable HTTPS, run:

```bash
sudo certbot --nginx -d your-domain.com
```

### Environment Security

- Change default passwords in `.env` file
- Use strong JWT secrets
- Configure proper CORS settings for production

## Monitoring

### PM2 Process Manager

- View logs: `pm2 logs`
- Monitor processes: `pm2 monit`
- Check status: `pm2 status`
- Restart application: `pm2 restart visipakalpojumi-backend`

### System Services

- Nginx status: `systemctl status nginx`
- PostgreSQL status: `systemctl status postgresql`

### Logs

Application logs are stored in:
- `/var/www/visipakalpojumi/logs/backend.log`
- `/var/www/visipakalpojumi/logs/backend-error.log`
- `/var/www/visipakalpojumi/logs/backend-out.log`

## Troubleshooting

### Common Issues

1. **Port 3001 not accessible**
   - Check if firewall allows port 3001
   - Verify backend is running: `pm2 status`

2. **Database connection failed**
   - Check PostgreSQL is running: `systemctl status postgresql`
   - Verify database credentials in `.env`

3. **Nginx not serving content**
   - Check Nginx configuration: `nginx -t`
   - Restart Nginx: `systemctl restart nginx`

4. **Permission issues**
   - Ensure files are owned by `www-data`: `chown -R www-data:www-data /var/www/visipakalpojumi`

### Debug Commands

```bash
# Check all services
pm2 status
systemctl status nginx
systemctl status postgresql

# View logs
pm2 logs visipakalpojumi-backend
tail -f /var/www/visipakalpojumi/logs/backend.log

# Test database connection
cd /var/www/visipakalpojumi/backend
npx prisma db push

# Test API endpoints
curl http://localhost:3001/health
curl http://localhost:3001/api/auth/health
```

## Updates

To update the application:

1. Stop the application: `sudo ./stop.sh`
2. Copy new files to `/var/www/visipakalpojumi`
3. Update dependencies: `cd backend && npm install`
4. Run migrations: `npx prisma db push`
5. Start the application: `sudo ./start.sh`

## Architecture

The application consists of:

- **Backend**: Node.js/Express API server (port 3001)
- **Frontend**: Next.js web application (served via Nginx)
- **Database**: PostgreSQL
- **Process Manager**: PM2
- **Reverse Proxy**: Nginx
- **File Storage**: Local uploads directory

## Support

For issues or questions:
1. Check the logs for error messages
2. Verify all services are running
3. Test individual components
4. Review configuration files