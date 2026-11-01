import { useState } from 'react';
import { View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '@/components/ui/GlassCard';
import { FormField } from '@/components/ui/FormField';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { colors, gradients } from '@/theme/colors';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
    const { login, signup } = useAuth();
    const [isLogin, setIsLogin] = useState(true);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = () => {
        if (isLogin) {
            login(email, password);
        } else {
            signup(name, email, password);
        }
    };

    return (
        <ScreenBackground>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 20 }}
            >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>

                    {/* Header */}
                    <Animated.View entering={FadeInDown.duration(600).springify()} className="items-center mb-8 mt-12">
                        <Text className="text-4xl font-bold text-white mb-2 tracking-tight">FreshCast</Text>
                        <Text className="text-ink-300 text-base">Your AI Kitchen Assistant</Text>
                    </Animated.View>

                    {/* Auth Card */}
                    <Animated.View entering={FadeInDown.duration(800).delay(100).springify()}>
                        <GlassCard radius={28} intensity={90} style={{ padding: 24 }}>
                            <Text className="text-white text-2xl font-bold mb-6">
                                {isLogin ? 'Welcome back' : 'Create account'}
                            </Text>

                            <View className="gap-5">
                                {!isLogin && (
                                    <FormField
                                        label="Full Name"
                                        placeholder="e.g. Gordon Ramsay"
                                        value={name}
                                        onChangeText={setName}
                                        returnKeyType="next"
                                    />
                                )}

                                <FormField
                                    label="Email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    returnKeyType="next"
                                />

                                <FormField
                                    label="Password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    returnKeyType="done"
                                />
                            </View>

                            {/* Submit Button */}
                            <Pressable onPress={handleSubmit} className="mt-8">
                                <LinearGradient
                                    colors={gradients.brand}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={{ height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <Text className="text-base font-bold" style={{ color: '#04120E' }}>
                                        {isLogin ? 'Sign In' : 'Sign Up'}
                                    </Text>
                                </LinearGradient>
                            </Pressable>

                            {/* Toggle Mode */}
                            <Pressable onPress={() => setIsLogin(!isLogin)} className="mt-6 items-center">
                                <Text className="text-ink-300">
                                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                                    <Text style={{ color: colors.mint[400] }} className="font-bold">
                                        {isLogin ? 'Sign up' : 'Log in'}
                                    </Text>
                                </Text>
                            </Pressable>
                        </GlassCard>
                    </Animated.View>

                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenBackground>
    );
}