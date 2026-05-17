from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'posts', views.PostViewSet)
router.register(r'comments', views.CommentViewSet)
router.register(r'campaigns', views.CampaignViewSet)
router.register(r'donations', views.DonationViewSet)
router.register(r'teams', views.TeamViewSet)
router.register(r'team-members', views.TeamMemberViewSet)
router.register(r'needy-persons', views.NeedyPersonViewSet)
router.register(r'polls', views.PollViewSet)
router.register(r'poll-options', views.PollOptionViewSet)
router.register(r'poll-votes', views.PollVoteViewSet)
router.register(r'surveys', views.SurveyViewSet)
router.register(r'survey-responses', views.SurveyResponseViewSet)
router.register(r'reports', views.ReportViewSet)
router.register(r'advertisements', views.AdvertisementViewSet)
router.register(r'live-broadcasts', views.LiveBroadcastViewSet)
router.register(r'zakat-collections', views.ZakatCollectionViewSet)
router.register(r'about-sections', views.AboutSectionViewSet)
router.register(r'charity-types', views.CharityTypeViewSet)
router.register(r'fund-types', views.FundTypeViewSet)
router.register(r'personalities', views.PersonalityViewSet)
router.register(r'village-history', views.VillageHistoryViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
