import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage'
import { SettingsPage } from './pages/SettingsPage';
import { AddProductPage } from './pages/AddProductPage';
import { ProductsPage } from './pages/ProductsPage';
import { AddAdvertisementPage } from './pages/AddAdvertisementPage';
import { AdvertisementsPage } from './pages/AdvertisementsPage';
import { AdvertisementPage } from './pages/AdvertisementPage';
import { AllAdvertisementsPage } from './pages/AllAdvertisementsPage';
import { ChatPage } from './pages/ChatPage';


export const useRoutes = isAuthenticated => {

    if (isAuthenticated) {
        return (
            <Routes>
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/chat/:userId" element={<ChatPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/:id" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/advertisements" element={<AdvertisementsPage />} />
                <Route path="/advertisements-list" element={<AllAdvertisementsPage />} />
                <Route path="/advertisements-list/category/:categoryId" element={<AllAdvertisementsPage />} />
                <Route path="/advertisements-list/city/:cityName" element={<AllAdvertisementsPage />} />
                <Route path="/advertisements/:id" element={<AdvertisementsPage />} />
                <Route path="/advertisement/:id" element={<AdvertisementPage />} />
                <Route path="/add-product" element={<AddProductPage />} />
                <Route path="/add-advertisement" element={<AddAdvertisementPage />} />
                <Route path="*" element={<Navigate to='/advertisements-list' />} />
            </Routes>
        )
    }

    return (
        <Routes>
            <Route exact path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<Navigate to='/' />} />
        </Routes>
    )
}