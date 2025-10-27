'use client'
import { Banner } from "@/components/layout/home"
import {FlashDeals} from "@/components/layout/home"
import {TopCategories} from "@/components/layout/home"
import {ProductList} from "@/components/layout/home"
import {TopFooter} from "@/components/layout/home"


export default function Page() {
  return (
    <main className="flex flex-col bg-gray-50">
      <Banner />
      <FlashDeals />
      <TopCategories />
      <ProductList />
      <TopFooter />
    </main>
  )
}