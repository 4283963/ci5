export const jadeVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;
  varying vec3 vObjectPosition;

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
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uInnerColor;
  uniform float uTransparency;
  uniform float uRoughness;
  uniform float uRefraction;
  uniform float uCottonDensity;
  uniform float uOilWetness;
  uniform vec3 uLightPosition;
  uniform float uLightIntensity;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;
  varying vec3 vObjectPosition;

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

  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 5; i++) {
      value += amplitude * snoise(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    return value;
  }

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    vec3 lightDir = normalize(uLightPosition - vWorldPosition);
    vec3 halfDir = normalize(lightDir + viewDir);

    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);

    vec3 objPosScaled = vObjectPosition * 2.5;
    float cottonNoise = fbm(objPosScaled + vec3(uTime * 0.02));
    float cottonPattern = smoothstep(0.15, 0.55, cottonNoise) * uCottonDensity;

    float veinNoise = fbm(objPosScaled * 4.0);
    float veins = smoothstep(0.55, 0.85, veinNoise) * 0.25;

    float depthFactor = 0.5 + 0.5 * vObjectPosition.y;
    vec3 baseColor = mix(uInnerColor, uColor, depthFactor);
    baseColor = mix(baseColor, vec3(0.92, 0.98, 0.88), cottonPattern * 0.35);
    baseColor = mix(baseColor, uInnerColor * 0.65, veins);

    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = baseColor * diff * uLightIntensity;

    float specPow = mix(16.0, 96.0, 1.0 - uRoughness);
    float spec = pow(max(dot(normal, halfDir), 0.0), specPow);
    vec3 specular = vec3(1.0, 0.98, 0.92) * spec * (0.4 + uOilWetness * 0.8) * uLightIntensity;

    vec3 reflectDir = reflect(-viewDir, normal);
    float envLight = max(dot(reflectDir, normalize(vec3(0.5, 1.0, 0.5))), 0.0);
    vec3 ambient = baseColor * (0.28 + 0.18 * envLight);

    float rim = pow(1.0 - max(dot(normal, viewDir), 0.0), 5.0);
    vec3 rimLight = vec3(0.7, 1.0, 0.78) * rim * 0.5 * uLightIntensity;

    vec3 subsurface = vec3(0.0);
    for (int i = 0; i < 3; i++) {
      float offset = float(i) * 0.25;
      vec3 samplePos = vObjectPosition + normal * offset;
      float ssNoise = fbm(samplePos * 3.0);
      subsurface += uInnerColor * ssNoise * 0.12 * uTransparency;
    }

    float alpha = mix(0.82, 0.98, 1.0 - uTransparency);
    alpha = mix(alpha, 0.72, fresnel * 0.35);
    alpha = mix(alpha, 0.95, cottonPattern * 0.5);

    vec3 finalColor = ambient + diffuse + specular + rimLight + subsurface;
    finalColor = mix(finalColor, uColor * 1.15, fresnel * 0.25);

    float noiseMicro = snoise(vObjectPosition * 50.0) * 0.025;
    finalColor += noiseMicro;

    gl_FragColor = vec4(finalColor, alpha);
  }
`
