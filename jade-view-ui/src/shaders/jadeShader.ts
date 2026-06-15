export const jadeVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vObjectPosition;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    vObjectPosition = position;
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`

export const jadeFragmentShader = `
  precision mediump float;

  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uInnerColor;
  uniform float uTransparency;
  uniform float uRoughness;
  uniform float uCottonDensity;
  uniform float uOilWetness;
  uniform vec3 uLightPosition;
  uniform float uLightIntensity;
  uniform float uQualityLevel;
  uniform float uFlashlightOn;
  uniform vec3 uFlashlightPos;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vObjectPosition;
  varying vec3 vWorldPosition;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  float fbm3(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    value += amplitude * snoise(p * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
    value += amplitude * snoise(p * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
    value += amplitude * snoise(p * frequency);
    return value;
  }

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    vec3 lightDir = normalize(uLightPosition - vWorldPosition);
    vec3 halfDir = normalize(lightDir + viewDir);

    float fresnel = pow(1.0 - clamp(dot(normal, viewDir), 0.0, 1.0), 3.0);

    vec3 objPos = vObjectPosition * 2.5;

    float baseNoise = fbm3(objPos + vec3(uTime * 0.015));
    float cottonPattern = smoothstep(0.1, 0.5, baseNoise) * uCottonDensity;

    float depthFactor = 0.5 + 0.5 * vObjectPosition.y;
    vec3 baseColor = mix(uInnerColor, uColor, depthFactor);
    baseColor = mix(baseColor, vec3(0.92, 0.98, 0.88), cottonPattern * 0.35);

    if (uQualityLevel > 0.5) {
      float veinNoise = fbm3(objPos * 4.0);
      float veins = smoothstep(0.6, 0.85, veinNoise) * 0.18;
      baseColor = mix(baseColor, uInnerColor * 0.7, veins);
    }

    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = baseColor * diff * uLightIntensity;

    float specPow = mix(16.0, 64.0, 1.0 - uRoughness);
    float spec = pow(max(dot(normal, halfDir), 0.0), specPow);
    vec3 specular = vec3(1.0, 0.98, 0.92) * spec * (0.35 + uOilWetness * 0.7) * uLightIntensity;

    vec3 ambient = baseColor * 0.32;

    float rim = pow(1.0 - clamp(dot(normal, viewDir), 0.0, 1.0), 4.0);
    vec3 rimLight = vec3(0.7, 1.0, 0.78) * rim * 0.4 * uLightIntensity;

    float ssAmount = uTransparency * 0.15;
    float ssNoise = fbm3(objPos * 2.0 + normal * 0.3);
    vec3 subsurface = uInnerColor * ssNoise * ssAmount;

    vec3 flashlightEffect = vec3(0.0);

    if (uFlashlightOn > 0.5) {
      vec3 toFlash = vWorldPosition - uFlashlightPos;
      float flashDist = length(toFlash);
      vec3 flashDir = normalize(toFlash);

      float spotRadius = 0.7;
      float spotFalloff = 1.0 / (1.0 + flashDist * flashDist * 0.5);
      float spotCutoff = smoothstep(spotRadius, spotRadius * 0.15, flashDist);

      float NdotL = max(dot(normal, -flashDir), 0.0);
      float wrapLight = max(dot(normal, -flashDir) * 0.5 + 0.5, 0.0);

      float flashDiffuse = wrapLight * spotCutoff * spotFalloff;

      vec3 flashHalf = normalize(-flashDir + viewDir);
      float flashSpec = pow(max(dot(normal, flashHalf), 0.0), 64.0);
      flashSpec *= spotCutoff * spotFalloff;

      vec3 warmLight = vec3(1.0, 0.95, 0.85);

      float fiberBase = snoise(vObjectPosition * 18.0);
      float fiberDetail = snoise(vObjectPosition * 40.0 + vec3(uTime * 0.03, 0.0, 0.0));
      float fiberPattern = abs(fiberBase) * 0.6 + abs(fiberDetail) * 0.4;
      fiberPattern = pow(fiberPattern, 0.8);

      float silkSheen = pow(abs(fiberBase), 2.0) * abs(fiberDetail);
      silkSheen = smoothstep(0.2, 0.8, silkSheen);

      float transmittance = (1.0 - NdotL) * 0.35 + 0.15;
      transmittance *= spotCutoff * spotFalloff;

      vec3 silkColor = mix(
        uInnerColor * 1.4,
        vec3(0.95, 1.0, 0.9),
        silkSheen * 0.5
      );

      vec3 fiberGlow = silkColor * fiberPattern * transmittance * 1.8;

      vec3 transColor = mix(uInnerColor * 1.2, vec3(0.95, 1.0, 0.88), transmittance * 0.6);

      flashlightEffect = warmLight * flashDiffuse * 2.5 * baseColor
                       + warmLight * flashSpec * 1.5
                       + fiberGlow
                       + transColor * transmittance * 0.6;

      float hotSpot = smoothstep(0.15, 0.0, flashDist) * spotFalloff;
      flashlightEffect += vec3(1.0, 0.98, 0.92) * hotSpot * 0.8;

      subsurface += uInnerColor * transmittance * 0.3;
    }

    float alpha = mix(0.85, 0.98, 1.0 - uTransparency);
    alpha = mix(alpha, 0.75, fresnel * 0.3);
    alpha = mix(alpha, 0.95, cottonPattern * 0.4);

    if (uFlashlightOn > 0.5) {
      vec3 toFlash2 = vWorldPosition - uFlashlightPos;
      float flashDist2 = length(toFlash2);
      float spotCutoff2 = smoothstep(0.7, 0.1, flashDist2);
      float wrapL = max(dot(normal, -normalize(toFlash2)) * 0.5 + 0.5, 0.0);
      float transAmt = wrapL * spotCutoff2 * uTransparency * 0.2;
      alpha = mix(alpha, 0.6, transAmt);
    }

    vec3 finalColor = ambient + diffuse + specular + rimLight + subsurface + flashlightEffect;
    finalColor = mix(finalColor, uColor * 1.12, fresnel * 0.22);

    gl_FragColor = vec4(finalColor, alpha);
  }
`

export const jadeSimpleFragmentShader = `
  precision mediump float;

  uniform vec3 uColor;
  uniform vec3 uInnerColor;
  uniform float uTransparency;
  uniform float uOilWetness;
  uniform float uLightIntensity;
  uniform float uFlashlightOn;
  uniform vec3 uFlashlightPos;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    vec3 lightDir = normalize(vec3(5.0, 8.0, 5.0) - vWorldPosition);
    vec3 halfDir = normalize(lightDir + viewDir);

    float fresnel = pow(1.0 - clamp(dot(normal, viewDir), 0.0, 1.0), 2.5);

    float diff = max(dot(normal, lightDir), 0.0);
    float spec = pow(max(dot(normal, halfDir), 0.0), 48.0);

    vec3 baseColor = mix(uInnerColor, uColor, 0.5 + 0.5 * vViewPosition.y * 0.1);
    vec3 finalColor = baseColor * (0.35 + diff * uLightIntensity)
                    + vec3(1.0, 0.98, 0.92) * spec * (0.3 + uOilWetness * 0.6) * uLightIntensity;
    finalColor = mix(finalColor, uColor * 1.1, fresnel * 0.2);

    float alpha = mix(0.88, 0.96, 1.0 - uTransparency);

    if (uFlashlightOn > 0.5) {
      vec3 toFlash = vWorldPosition - uFlashlightPos;
      float flashDist = length(toFlash);
      float spot = smoothstep(0.7, 0.1, flashDist);
      float wrapL = max(dot(normal, -normalize(toFlash)) * 0.5 + 0.5, 0.0);
      float intensity = spot * wrapL;
      finalColor += uInnerColor * intensity * 2.0;
      finalColor += vec3(1.0, 0.95, 0.85) * intensity * 0.8;
      alpha = mix(alpha, 0.65, intensity * uTransparency * 0.3);
    }

    gl_FragColor = vec4(finalColor, alpha);
  }
`
