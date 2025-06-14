# Tymout Frontend Deployment Guide

## Deployment Options

The Tymout frontend application offers three different build approaches to accommodate different deployment scenarios:

### 1. Basic Build (Currently Used in Production)

The basic build uses vanilla React Scripts without CRACO optimizations. This build is the most reliable for ensuring proper UI rendering and is currently used in the production environment.

**Build Command:**
```bash
npm run build:basic
```

**Build Script:**
```bash
./basic-build.sh
```

**Characteristics:**
- No aggressive optimizations
- Reliable rendering of all UI components
- Slightly larger bundle size
- No tree shaking or aggressive code splitting

### 2. Balanced Build (Recommended for Testing)

The balanced build uses a modified CRACO configuration with safe optimizations that shouldn't break UI rendering while still providing some performance benefits.

**Build Command:**
```bash
npm run build:balanced
```

**Build Script:**
```bash
./balanced-build.sh
```

**Characteristics:**
- Moderate optimizations
- Safe code splitting
- No aggressive tree shaking
- Gzip compression with higher thresholds
- Maintains console logs for debugging

### 3. Full Optimization Build (Not Recommended)

The fully optimized build uses aggressive CRACO optimizations but may cause UI rendering issues in production.

**Build Command:**
```bash
npm run build
```

**Build Script:**
```bash
./amplify-build.sh
```

**Characteristics:**
- Aggressive optimizations
- Aggressive code splitting
- Full tree shaking
- Aggressive compression
- Removes console logs and debugger statements

## Deployment Issues and Solutions

### Known Issues

1. **UI Rendering Problems**
   - **Symptoms**: Only skeleton loading states visible, content not rendering
   - **Cause**: Aggressive optimizations in CRACO configuration
   - **Solution**: Use basic build without CRACO optimizations

2. **Missing Dependencies**
   - **Symptoms**: Build errors related to missing modules
   - **Solution**: Ensure all dependencies are properly listed in package.json

3. **Environment Variables**
   - **Symptoms**: API calls failing in production
   - **Solution**: Ensure all service URLs are correctly set in:
     - `.env.production`
     - `env-config.js`
     - `amplify.yml`
     - Build scripts

### Microservices URLs

The application connects to the following microservices:

- API Gateway: `https://y9tvvqw2ff.us-east-1.awsapprunner.com`
- Event Service: `https://4racpsbxvp.ap-southeast-1.awsapprunner.com`
- User Service: `https://dz9fi6brn6.ap-southeast-1.awsapprunner.com`
- Message Service: `https://gse6svsquj.ap-south-1.awsapprunner.com`
- Chat Service: `https://gse6svsquj.ap-south-1.awsapprunner.com`
- Discovery Service: `https://uubgaznt7a.ap-south-1.awsapprunner.com`

## Deployment Process

1. Choose the appropriate build script based on your requirements
2. Update the `amplify.yml` file to use the selected build script
3. Commit and push changes to trigger AWS Amplify deployment
4. Monitor the build process in the AWS Amplify console
5. Test the deployed application thoroughly

## Performance Considerations

If you want to gradually reintroduce optimizations:

1. Start with the basic build
2. Test the balanced build
3. Incrementally add optimizations one by one
4. Test thoroughly after each change

Remember that the following optimizations have been identified as potentially problematic:
- Aggressive tree shaking
- Content visibility CSS properties
- Aggressive code splitting
- Compression with low thresholds

## Troubleshooting

If you encounter rendering issues:
1. Check browser console for errors
2. Verify that all environment variables are correctly set
3. Try reverting to the basic build
4. Check for CSS issues, particularly with content visibility properties
5. Verify that all required dependencies are installed
