# Nginx Configuration Setup

## Complete Nginx Configuration Added

A complete nginx configuration file has been created at `./nginx.conf` with all necessary routing rules for your OfficeRest application.

## What This Configuration Includes

### Routing Rules
- **`/uploads/`** → Backend container (port 8000) - **Fixes carousel images not displaying**
- **`/`** → User frontend container (port 8080)
- **`/admin/`** → Admin frontend container (port 8081)
- **`/api/`** → Backend container (port 8000)

### Additional Features
- SSL/HTTPS configuration
- Security headers (XSS protection, CSRF, etc.)
- Gzip compression
- Proxy timeout settings
- HTTP to HTTPS redirect

## Installation Steps

### 1. Copy Configuration File
```bash
sudo cp /home/restweb/OfficeRestNoOtp/nginx.conf /etc/nginx/sites-available/rest.ntc.net.np
```

### 2. Update SSL Certificate Paths
Edit `/etc/nginx/sites-available/rest.ntc.net.np` and update these lines with your actual certificate paths:
```nginx
ssl_certificate /path/to/your/certificate.crt;
ssl_certificate_key /path/to/your/private.key;
```

### 3. Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/rest.ntc.net.np /etc/nginx/sites-enabled/
```

### 4. Test Configuration
```bash
sudo nginx -t
```

### 5. Restart Nginx
```bash
sudo systemctl restart nginx
```

## Verification

After applying the configuration, test these URLs:
- **User Frontend**: `https://rest.ntc.net.np/` ✅
- **Admin Panel**: `https://rest.ntc.net.np/admin/` ✅
- **API**: `https://rest.ntc.net.np/api/v1/branches` ✅
- **Carousel Images**: `https://rest.ntc.net.np/uploads/Carousel/Images/filename.jpg` ✅

## Key Fix for Carousel Images

The **`/uploads/` routing rule** is what fixes the carousel images not displaying in the admin panel. Without this rule, upload requests were being served by the frontend container instead of the backend where the images are stored.

## Troubleshooting

If images still don't display:
1. Check nginx error logs: `sudo tail -f /var/log/nginx/error.log`
2. Verify containers are running: `docker compose -f docker-compose.prod.yml ps`
3. Test backend directly: `curl -I http://localhost:8000/uploads/Carousel/Images/filename.jpg`

## Notes

- The `/uploads/` location must come **before** the `/` location in nginx config
- All containers must be running for the routing to work
- SSL certificates must be valid for HTTPS to work properly</contents>
</xai:function_call: Write>
<parameter name="path">/home/restweb/OfficeRestNoOtp/NGINX_SETUP.md