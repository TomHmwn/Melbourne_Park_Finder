Rails.application.routes.draw do
  devise_for :users

  # Sidekiq Web UI, only for admins.
  require "sidekiq/web"
  authenticate :user, ->(user) { user.admin? } do
    mount Sidekiq::Web => '/sidekiq'
  end

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  root to: 'parking_bays#index'
  post 'parking_bays/filter', to: 'parking_bays#filter', as: 'filter_parking_bays'
  resources :parking_bays, only: [:show] do
    resources :trips, only: [:show, :new, :create]
  end
end
